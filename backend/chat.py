import json
from datetime import datetime
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
    
    res = (
        supabase.table("friends")
        .select("*")
        .or_(f"and(user_id.eq.{user1_pk},friend_id.eq.{user2_pk}),and(user_id.eq.{user2_pk},friend_id.eq.{user1_pk})")
        .execute()
    )
    return bool(res.data)


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
    if not to_public_key:
        raise HTTPException(status_code=404, detail="Recipient not found")

    # Encrypt message using hybrid PQC + AES
    encrypted_payload = crypto.hybrid_encrypt(to_public_key, content.encode("utf-8"))

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

    res = (
        supabase.table("messages")
        .select("*, sender:signup_users!sender_id(user_id), receiver:signup_users!receiver_id(user_id)")
        .or_(f"and(sender_id.eq.{user_pk},receiver_id.eq.{friend_pk}),and(sender_id.eq.{friend_pk},receiver_id.eq.{user_pk})")
        .order("created_at")
        .execute()
    )

    messages = []
    for msg in res.data or []:
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
    
    res = (
        supabase.table("messages")
        .select("sender_id, receiver_id, created_at, sender:signup_users!sender_id(user_id), receiver:signup_users!receiver_id(user_id)")
        .or_(f"sender_id.eq.{user_pk},receiver_id.eq.{user_pk}")
        .order("created_at", desc=True)
        .execute()
    )

    conversations = {}
    for msg in res.data or []:
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