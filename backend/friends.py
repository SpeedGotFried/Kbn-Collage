import base64
from datetime import datetime
from typing import List

from fastapi import HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_KEY", "")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

supabase = create_client(supabase_url, supabase_key)


class FriendRequest(BaseModel):
    sender_id: str
    receiver_id: str
    status: str  # pending, accepted, declined
    created_at: datetime


class FriendResponse(BaseModel):
    user_id: str
    friend_id: str
    status: str
    created_at: datetime


def send_friend_request(from_user_id: str, to_user_id: str) -> FriendRequest:
    if from_user_id == to_user_id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")

    # Get user IDs from signup_users table
    from_user = supabase.table("signup_users").select("id").eq("user_id", from_user_id).execute()
    to_user = supabase.table("signup_users").select("id").eq("user_id", to_user_id).execute()
    
    if not from_user.data or not to_user.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    sender_id = from_user.data[0]["id"]
    receiver_id = to_user.data[0]["id"]

    # Check if already friends (either direction)
    existing_friendship_1 = (
        supabase.table("friends")
        .select("*")
        .eq("user_id", sender_id)
        .eq("friend_id", receiver_id)
        .execute()
    )
    existing_friendship_2 = (
        supabase.table("friends")
        .select("*")
        .eq("user_id", receiver_id)
        .eq("friend_id", sender_id)
        .execute()
    )
    if (existing_friendship_1.data and len(existing_friendship_1.data) > 0) or (
        existing_friendship_2.data and len(existing_friendship_2.data) > 0
    ):
        raise HTTPException(status_code=400, detail="You are already friends")

    # Check if a pending request exists (either direction)
    existing_request_1 = (
        supabase.table("friend_requests")
        .select("*")
        .eq("sender_id", sender_id)
        .eq("receiver_id", receiver_id)
        .eq("status", "pending")
        .execute()
    )
    existing_request_2 = (
        supabase.table("friend_requests")
        .select("*")
        .eq("sender_id", receiver_id)
        .eq("receiver_id", sender_id)
        .eq("status", "pending")
        .execute()
    )
    if (existing_request_1.data and len(existing_request_1.data) > 0) or (
        existing_request_2.data and len(existing_request_2.data) > 0
    ):
        raise HTTPException(status_code=400, detail="Friend request already exists")

    data = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    res = supabase.table("friend_requests").insert(data).execute()
    
    # Convert back to user_id format for response
    return FriendRequest(
        sender_id=from_user_id,
        receiver_id=to_user_id,
        status=res.data[0]["status"],
        created_at=res.data[0]["created_at"]
    )


def get_friend_requests(user_id: str):
    # Get user's database ID
    user = supabase.table("signup_users").select("id").eq("user_id", user_id).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_pk = user.data[0]["id"]
    
    # Received requests with sender info
    received = (
        supabase.table("friend_requests")
        .select("*, sender:signup_users!sender_id(user_id, full_name, phone_number)")
        .eq("receiver_id", user_pk)
        .eq("status", "pending")
        .execute()
    )
    
    # Sent requests with receiver info
    sent = (
        supabase.table("friend_requests")
        .select("*, receiver:signup_users!receiver_id(user_id, full_name, phone_number)")
        .eq("sender_id", user_pk)
        .eq("status", "pending")
        .execute()
    )
    
    return {"received": received.data or [], "sent": sent.data or []}


def respond_to_request(request_id: int, accept: bool):
    status_val = "accepted" if accept else "declined"
    
    # Update the friend request status
    res = supabase.table("friend_requests").update({
        "status": status_val,
        "responded_at": datetime.utcnow().isoformat()
    }).eq("id", request_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request_data = res.data[0]
    
    # If accepted, create friendship entry
    if accept:
        friendship_data = {
            "user_id": request_data["sender_id"],
            "friend_id": request_data["receiver_id"],
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("friends").insert(friendship_data).execute()
    
    return request_data


def list_friends(user_id: str) -> List[FriendResponse]:
    # Get user's database ID
    user = supabase.table("signup_users").select("id").eq("user_id", user_id).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_pk = user.data[0]["id"]
    
    # Get friends with their info (two-direction fetch, since OR is unsupported)
    res_1 = (
        supabase.table("friends")
        .select("*, friend:signup_users!friend_id(user_id, full_name, phone_number), user:signup_users!user_id(user_id, full_name, phone_number)")
        .eq("user_id", user_pk)
        .execute()
    )
    res_2 = (
        supabase.table("friends")
        .select("*, friend:signup_users!friend_id(user_id, full_name, phone_number), user:signup_users!user_id(user_id, full_name, phone_number)")
        .eq("friend_id", user_pk)
        .execute()
    )
    # Merge results
    merged_rows = []
    if res_1.data:
        merged_rows.extend(res_1.data)
    if res_2.data:
        merged_rows.extend(res_2.data)
    
    friends = []
    for row in merged_rows or []:
        if row["user_id"] == user_pk:
            friend_info = row["friend"]
            friend_id = friend_info["user_id"]
        else:
            friend_info = row["user"]
            friend_id = friend_info["user_id"]
        
        friends.append(
            FriendResponse(
                user_id=user_id,
                friend_id=friend_id,
                status="accepted",  # All entries in friends table are accepted
                created_at=row["created_at"],
            )
        )
    return friends


def generate_qr_for_user(user_16_id: str) -> str:
    """Return a base64-encoded PNG of QR code for the 16-digit ID."""
    import qrcode
    from io import BytesIO

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(user_16_id)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = BytesIO()
    img.save(buf, format="PNG")
    encoded = base64.b64encode(buf.getvalue()).decode()
    return f"data:image/png;base64,{encoded}"