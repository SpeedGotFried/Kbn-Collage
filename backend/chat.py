import json
from datetime import datetime
import base64
from typing import List, Optional

from fastapi import HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

import crypto
import auth

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_KEY", "")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

supabase = create_client(supabase_url, supabase_key)


class MessageSend(BaseModel):
    receiver_id: str
    content: str


class MessageResponse(BaseModel):
    id: int
    sender_id: str
    receiver_id: str
    encrypted_content: dict  # Changed to dict for JSONB
    created_at: datetime


def is_friend(user1_id: str, user2_id: str) -> bool:
    """Check if two users are friends."""
    # Get user database IDs
    user1 = supabase.table("signup_users").select("id").eq("user_id", user1_id).execute()
    user2 = supabase.table("signup_users").select("id").eq("user_id", user2_id).execute()
    
    if not user1.data or not user2.data:
        return False
    
    user1_pk = user1.data[0]["id"]
    user2_pk = user2.data[0]["id"]
    
    res1 = (
        supabase.table("friends")
        .select("id")
        .eq("user_id", user1_pk)
        .eq("friend_id", user2_pk)
        .execute()
    )
    if res1.data:
        return True
    res2 = (
        supabase.table("friends")
        .select("id")
        .eq("user_id", user2_pk)
        .eq("friend_id", user1_pk)
        .execute()
    )
    return bool(res2.data)


async def send_message(from_user_id: str, to_user_id: str, content: str) -> MessageResponse:
    # Verify friendship
    if not is_friend(from_user_id, to_user_id):
        raise HTTPException(status_code=403, detail="Can only message friends")

    # Get user database IDs
    from_user = supabase.table("signup_users").select("id").eq("user_id", from_user_id).execute()
    to_user = supabase.table("signup_users").select("id").eq("user_id", to_user_id).execute()
    
    if not from_user.data or not to_user.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    sender_id = from_user.data[0]["id"]
    receiver_id = to_user.data[0]["id"]

    # Get recipient's public key
    to_public_key = await auth.get_user_public_key(to_user_id)

    # Encrypt message using hybrid PQC + AES if key exists
    if to_public_key:
        encrypted_payload = crypto.hybrid_encrypt(to_public_key, content.encode("utf-8"))
    else:
        # Fallback: store as base64 plaintext envelope for development when key is missing
        # DO NOT USE IN PRODUCTION
        print("[WARN] Recipient public key not found. Storing message in plaintext envelope for development.")
        encrypted_payload = {
            "scheme": "PLAINTEXT_DEV",
            "content_b64": base64.b64encode(content.encode("utf-8")).decode("ascii"),
        }

    # Store encrypted message with JSONB format
    message_data = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "encrypted_content": encrypted_payload,  # Direct dict for JSONB
        "created_at": datetime.utcnow().isoformat(),
    }

    res = supabase.table("messages").insert(message_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    # Convert back to user_id format for response
    response_data = res.data[0]
    return MessageResponse(
        id=response_data["id"],
        sender_id=from_user_id,
        receiver_id=to_user_id,
        encrypted_content=response_data["encrypted_content"],
        created_at=response_data["created_at"]
    )


async def get_messages(user_id: str, friend_id: str) -> List[MessageResponse]:
    """Get messages between user and friend."""
    if not is_friend(user_id, friend_id):
        raise HTTPException(status_code=403, detail="Can only view messages with friends")

    # Get user database IDs
    user = supabase.table("signup_users").select("id").eq("user_id", user_id).execute()
    friend = supabase.table("signup_users").select("id").eq("user_id", friend_id).execute()
    
    if not user.data or not friend.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_pk = user.data[0]["id"]
    friend_pk = friend.data[0]["id"]

    # Fetch messages in both directions then merge and sort
    res1 = (
        supabase.table("messages")
        .select("*, sender:signup_users!sender_id(user_id), receiver:signup_users!receiver_id(user_id)")
        .eq("sender_id", user_pk)
        .eq("receiver_id", friend_pk)
        .order("created_at")
        .execute()
    )
    res2 = (
        supabase.table("messages")
        .select("*, sender:signup_users!sender_id(user_id), receiver:signup_users!receiver_id(user_id)")
        .eq("sender_id", friend_pk)
        .eq("receiver_id", user_pk)
        .order("created_at")
        .execute()
    )
    combined = []
    if res1.data:
        combined.extend(res1.data)
    if res2.data:
        combined.extend(res2.data)
    # Sort by created_at to preserve chronology
    combined.sort(key=lambda m: m.get("created_at", ""))

    messages = []
    for msg in combined or []:
        messages.append(MessageResponse(
            id=msg["id"],
            sender_id=msg["sender"]["user_id"],
            receiver_id=msg["receiver"]["user_id"],
            encrypted_content=msg["encrypted_content"],
            created_at=msg["created_at"]
        ))
    
    return messages


async def decrypt_message(message: MessageResponse, user_id: str) -> str:
    """Decrypt a message for the user."""
    # Only the recipient can decrypt
    if message.receiver_id != user_id:
        raise HTTPException(status_code=403, detail="Cannot decrypt message not intended for you")

    # Get user's private key (Note: This will return None as private keys shouldn't be stored)
    private_key = await auth.get_user_private_key(user_id)
    if not private_key:
        raise HTTPException(status_code=501, detail="Message decryption not implemented - private keys should be stored client-side")

    try:
        # encrypted_content is already a dict (JSONB), no need to parse JSON
        encrypted_payload = message.encrypted_content
        decrypted_bytes = crypto.hybrid_decrypt(private_key, encrypted_payload)
        return decrypted_bytes.decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to decrypt message: {str(e)}")


def get_conversations(user_id: str) -> List[dict]:
    """Get list of conversations for a user."""
    # Get user database ID
    user = supabase.table("signup_users").select("id").eq("user_id", user_id).execute()
    if not user.data:
        return []
    
    user_pk = user.data[0]["id"]
    
    # Fetch both directions and merge
    res1 = (
        supabase.table("messages")
        .select("sender_id, receiver_id, created_at, sender:signup_users!sender_id(user_id), receiver:signup_users!receiver_id(user_id)")
        .eq("sender_id", user_pk)
        .order("created_at", desc=True)
        .execute()
    )
    res2 = (
        supabase.table("messages")
        .select("sender_id, receiver_id, created_at, sender:signup_users!sender_id(user_id), receiver:signup_users!receiver_id(user_id)")
        .eq("receiver_id", user_pk)
        .order("created_at", desc=True)
        .execute()
    )
    merged_rows = []
    if res1.data:
        merged_rows.extend(res1.data)
    if res2.data:
        merged_rows.extend(res2.data)

    conversations = {}
    for msg in merged_rows or []:
        if msg["sender_id"] == user_pk:
            other_user_id = msg["receiver"]["user_id"]
        else:
            other_user_id = msg["sender"]["user_id"]
            
        if other_user_id not in conversations:
            conversations[other_user_id] = {
                "user_id": other_user_id,
                "last_message_at": msg["created_at"]
            }

    return list(conversations.values())