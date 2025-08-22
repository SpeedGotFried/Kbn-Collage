import os
import json
from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from auth import PhoneRequest, VerifyOTPRequest, SignupRequest, SetIncognitoPasswordRequest, VerifyIncognitoPasswordRequest, register_or_login_user, send_otp, verify_otp, create_jwt_token, get_current_user, signup_user, format_phone_number, supabase, check_user_has_incognito_password, set_incognito_password, verify_incognito_password
from friends import send_friend_request, get_friend_requests, respond_to_request, list_friends, generate_qr_for_user
from chat import MessageSend, send_message, get_messages, get_conversations
import base64

app = FastAPI(title="Quantum-Safe Secure Messaging API")

# Allow all origins for development - remove in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}


# Auth endpoints
@app.post("/v1/auth/send-otp")
async def api_send_otp(req: PhoneRequest):
    result = await send_otp(req.phone)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to send OTP"))
    
    sms_result = result.get("smsResult", {})
    is_fallback = sms_result.get("fallback", False)
    sms_success = sms_result.get("success", False)
    
    # Determine appropriate message based on SMS status
    if is_fallback:
        message = f"OTP generated successfully. SMS service temporarily unavailable - check server console for OTP: {result.get('otp')}"
    elif sms_success:
        message = "OTP sent successfully via SMS"
    else:
        message = f"OTP generated but SMS delivery failed - check server console for OTP: {result.get('otp')}"
    
    return {
        "success": True,
        "message": message,
        "phoneNumber": result.get("phoneNumber"),
        "smsStatus": sms_success,
        "fallbackMode": is_fallback,
        "debug": {
            "generatedOtp": result.get("otp"),  # For debugging - remove in production
            "otpStored": result.get("otpStored", False),
            "smsError": sms_result.get("error") if not sms_success else None
        }
    }


@app.post("/v1/auth/verify-otp")
async def api_verify_otp(req: VerifyOTPRequest):
    valid = await verify_otp(req.phone, req.otp)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    user = await register_or_login_user(req.phone)
    token = create_jwt_token(user.user_id, user.phone)
    return {"token": token, "user": user.dict()}


@app.post("/v1/auth/check-phone")
async def api_check_phone(req: PhoneRequest):
    """Check if phone number exists in database for login validation."""
    try:
        print(f"Original phone input: {req.phone}")
        formatted_phone = format_phone_number(req.phone)
        print(f"Formatted phone: {formatted_phone}")
        
        # Check if user exists in signup_users table
        response = supabase.table("signup_users").select("*").eq("phone_number", formatted_phone).execute()
        print(f"Database response: {response.data}")
        
        # Also check all phone numbers in database for debugging
        all_users = supabase.table("signup_users").select("phone_number").execute()
        print(f"All phone numbers in database: {[user['phone_number'] for user in all_users.data]}")
        
        exists = bool(response.data)
        
        return {
            "success": True,
            "exists": exists,
            "phone_number": formatted_phone
        }
        
    except Exception as e:
        print(f"Phone check error: {e}")
        raise HTTPException(status_code=400, detail="Invalid phone number format")


@app.post("/v1/auth/signup")
async def api_signup(req: SignupRequest):
    result = await signup_user(req)
    if not result.get("success"):
        error_code = result.get("error_code", "SIGNUP_FAILED")
        if error_code == "EMAIL_EXISTS":
            raise HTTPException(status_code=409, detail=result.get("message", "Email already exists"))
        elif error_code == "PHONE_EXISTS":
            raise HTTPException(status_code=409, detail=result.get("message", "Phone number already exists"))
        elif error_code == "INVALID_PHONE":
            raise HTTPException(status_code=400, detail=result.get("message", "Invalid phone number"))
        else:
            raise HTTPException(status_code=500, detail=result.get("message", "Signup failed"))
    
    return {
        "success": True,
        "message": result.get("message", "User created successfully"),
        "user": result.get("user")
    }


@app.get("/v1/auth/incognito/check")
async def api_check_incognito_password(user=Depends(get_current_user)):
    """Check if user has set an incognito mode password"""
    has_password = await check_user_has_incognito_password(user.user_id)
    return {
        "has_password": has_password
    }


@app.post("/v1/auth/incognito/set")
async def api_set_incognito_password(req: SetIncognitoPasswordRequest, user=Depends(get_current_user)):
    """Set incognito mode password for user"""
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    result = await set_incognito_password(user.user_id, req.password)
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["message"])


@app.post("/v1/auth/incognito/verify")
async def api_verify_incognito_password(req: VerifyIncognitoPasswordRequest, user=Depends(get_current_user)):
    """Verify incognito mode password for user"""
    is_valid = await verify_incognito_password(user.user_id, req.password)
    return {
        "valid": is_valid
    }


# Profile: QR code & ID
class QRResponse(BaseModel):
    user_id: str
    qr_code: str  # data URL


@app.get("/v1/profile/qr", response_model=QRResponse)
async def profile_qr(user=Depends(get_current_user)):
    qr = generate_qr_for_user(user.user_id)
    return {"user_id": user.user_id, "qr_code": qr}


# Current user profile (used by frontend to fetch own 16-digit ID)
@app.get("/v1/profile/me")
async def profile_me(user=Depends(get_current_user)):
    return {
        "id": user.id,
        "user_id": user.user_id,
        "phone_number": user.phone,
        "created_at": user.created_at,
    }


# Friends endpoints
class FriendRequestPayload(BaseModel):
    receiver_id: str


@app.post("/v1/friends/request")
async def api_friends_request(payload: FriendRequestPayload, user=Depends(get_current_user)):
    req = send_friend_request(user.user_id, payload.receiver_id)
    return req.dict()

@app.get("/v1/friends/requests")
async def api_friends_requests(user=Depends(get_current_user)):
    return get_friend_requests(user.user_id)


class FriendRespondPayload(BaseModel):
    request_id: int
    accept: bool


@app.post("/v1/friends/respond")
async def api_friends_respond(payload: FriendRespondPayload, user=Depends(get_current_user)):
    res = respond_to_request(payload.request_id, payload.accept)
    return res


@app.get("/v1/friends/list")
async def api_friends_list(user=Depends(get_current_user)):
    return [f.dict() for f in list_friends(user.user_id)]


@app.post("/v1/chat/send")
async def api_chat_send(payload: MessageSend, user=Depends(get_current_user)):
    msg = await send_message(user.user_id, payload.receiver_id, payload.content)
    return msg

@app.get("/v1/chat/messages/{friend_id}")
async def api_chat_messages(friend_id: str, user=Depends(get_current_user)):
    msgs = await get_messages(user.user_id, friend_id)
    return msgs

@app.get("/v1/chat/conversations")
async def api_chat_conversations(user=Depends(get_current_user)):
    return get_conversations(user.user_id)


if __name__ == "__main__":
    import uvicorn
    import logging
    
    # Configure logging to filter out OPTIONS requests
    class NoOptionsFilter(logging.Filter):
        def filter(self, record):
            # Filter out OPTIONS requests from uvicorn access logs
            return not (hasattr(record, 'getMessage') and 'OPTIONS' in record.getMessage())
    
    # Apply filter to uvicorn access logger
    logging.getLogger("uvicorn.access").addFilter(NoOptionsFilter())
    
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)