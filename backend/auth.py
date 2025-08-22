import os
import secrets
import asyncio
import json
import re
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from supabase import create_client, Client
from pydantic import BaseModel, Field, AliasChoices
from passlib.context import CryptContext

# Import OTP sender module
from otp_sender import send_otp_sms


# Schemas
class PhoneRequest(BaseModel):
    phone: str = Field(validation_alias=AliasChoices('phone', 'phoneNumber'))


class VerifyOTPRequest(BaseModel):
    phone: str = Field(validation_alias=AliasChoices('phone', 'phoneNumber'))
    otp: str = Field(validation_alias=AliasChoices('otp', 'code'))


class SignupRequest(BaseModel):
    full_name: str = Field(validation_alias=AliasChoices('full_name', 'fullName'))
    email: str
    phone_number: str = Field(validation_alias=AliasChoices('phone_number', 'phoneNumber', 'phone'))


class UserResponse(BaseModel):
    id: str
    phone: str
    user_id: str  # 16-digit ID
    created_at: datetime


class SetIncognitoPasswordRequest(BaseModel):
    password: str
    confirm_password: str


class VerifyIncognitoPasswordRequest(BaseModel):
    password: str


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Auth dependency
security = HTTPBearer()

# Supabase client
supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_KEY", "")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
jwt_secret = os.getenv("JWT_SECRET", "secret")
otp_api_url = os.getenv("OTP_API_URL", "")
otp_api_key = os.getenv("OTP_API_KEY", "")

# SMS Configuration - Now handled by otp_sender.py
# Old SMS variables removed - use TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER instead

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

supabase: Client = create_client(supabase_url, supabase_key)
supabase_admin: Client = create_client(supabase_url, supabase_service_key) if supabase_service_key else supabase


def generate_16digit_id() -> str:
    """Generate a unique 16-digit user ID."""
    return "".join([str(secrets.randbelow(10)) for _ in range(16)])


def create_jwt_token(user_id: str, phone: str) -> str:
    payload = {
        "user_id": user_id,
        "phone": phone,
        "exp": datetime.utcnow() + timedelta(days=30),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, jwt_secret, algorithm="HS256")


def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_jwt_token(credentials.credentials)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    # Fetch user from signup_users table to ensure they still exist
    response = supabase.table("signup_users").select("*").eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    user_data = response.data[0]
    return UserResponse(
        id=str(user_data["id"]),
        phone=user_data["phone_number"],
        user_id=user_data["user_id"],
        created_at=user_data["created_at"]
    )


def format_phone_number(phone: str) -> str:
    """Format phone number to standard format (10-digit without country code)."""
    # Remove all non-digit characters
    phone = re.sub(r'\D', '', phone)
    
    # If starts with country code 91, remove it
    if phone.startswith('91') and len(phone) == 12:
        phone = phone[2:]  # Remove the 91 prefix
    
    # Validate 10-digit number
    if len(phone) == 10:
        # Check if the 10-digit number starts with 6, 7, 8, or 9
        if phone[0] in ['6', '7', '8', '9']:
            return phone  # Return 10-digit number without country code
        else:
            raise ValueError("Invalid Indian mobile number format")
    else:
        raise ValueError("Invalid phone number format")


def validate_phone_number(phone: str) -> bool:
    """Validate phone number format."""
    try:
        formatted = format_phone_number(phone)
        # Check if formatted number is 10 digits and starts with 6,7,8,9
        if len(formatted) == 10:
            return formatted[0] in ['6', '7', '8', '9']
        return False
    except:
        return False


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(secrets.randbelow(900000) + 100000)


async def store_otp_in_db(phone: str, otp: str) -> bool:
    """Store OTP in Supabase database."""
    try:
        formatted_phone = format_phone_number(phone)
        
        # Mark existing OTPs as verified (inactive)
        supabase.table("otp_verifications").update({"is_verified": True}).eq("phone_number", formatted_phone).execute()
        
        # Insert new OTP with expiration time
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        otp_data = {
            "phone_number": formatted_phone,
            "otp": otp,
            "is_verified": False,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at.isoformat()
        }
        
        response = supabase.table("otp_verifications").insert(otp_data).execute()
        return bool(response.data)
    except Exception as e:
        print(f"Failed to store OTP in database: {e}")
        return False


# OTP SMS sending is now handled by otp_sender.py module
# The send_otp_sms function has been moved to otp_sender.py


async def send_otp(phone: str) -> dict:
    """Send OTP to phone number - main function."""
    try:
        print(f"📱 Starting OTP process for {phone}")
        
        # Format and validate phone number
        formatted_phone = format_phone_number(phone)
        
        if not validate_phone_number(formatted_phone):
            raise ValueError("Invalid phone number format. Must be a valid 10-digit Indian mobile number starting with 6-9")
        
        # Generate OTP
        otp = generate_otp()
        print(f"📱 Generated OTP: {otp}")
        
        # Store OTP in database - this is critical and must succeed
        otp_stored = False
        try:
            if not await store_otp_in_db(formatted_phone, otp):
                raise Exception("Failed to store OTP in database")
            otp_stored = True
            print(f"✅ OTP stored in database for {formatted_phone}")
        except Exception as store_error:
            print(f"❌ Failed to store OTP: {store_error}")
            raise store_error  # If we can't store OTP, the whole process fails
        
        # Send OTP via SMS - this can fail without breaking the process
        sms_result = None
        try:
            sms_result = await send_otp_sms(formatted_phone, otp)
            print(f"📱 SMS result: {'Success' if sms_result.get('success') else 'Failed'}")
        except Exception as sms_error:
            print(f"⚠️ SMS sending failed: {sms_error}")
            sms_result = {
                "success": False,
                "error": f"SMS service error: {str(sms_error)}",
                "exception": type(sms_error).__name__
            }
        
        return {
            "success": True,
            "message": "OTP sent successfully" if sms_result and sms_result.get("success") else "OTP generated (SMS may have failed)",
            "phoneNumber": formatted_phone,
            "smsResult": sms_result,
            "otp": otp,  # For debugging - remove in production
            "otpStored": otp_stored
        }
        
    except Exception as e:
        print(f"📱 Send OTP error: {e}")
        return {
            "success": False,
            "error": f"Failed to send OTP: {str(e)}",
            "message": str(e)
        }


async def verify_otp(phone: str, otp: str) -> bool:
    """Verify OTP code against database."""
    try:
        formatted_phone = format_phone_number(phone)
        
        # Find the most recent unverified OTP for this phone
        response = supabase.table("otp_verifications").select("*").eq("phone_number", formatted_phone).eq("is_verified", False).order("created_at", desc=True).limit(1).execute()
        
        if not response.data:
            return False
        
        stored_otp = response.data[0]
        
        # Check if OTP matches
        if stored_otp["otp"] != otp:
            return False
        
        # Check if OTP is not expired using expires_at field
        if stored_otp.get("expires_at"):
            expires_at = datetime.fromisoformat(stored_otp["expires_at"].replace('Z', '+00:00'))
            if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
                return False
        else:
            # Fallback to created_at + 10 minutes if expires_at is not set
            created_at = datetime.fromisoformat(stored_otp["created_at"].replace('Z', '+00:00'))
            if datetime.utcnow().replace(tzinfo=created_at.tzinfo) - created_at > timedelta(minutes=10):
                return False
        
        # Mark OTP as verified
        supabase.table("otp_verifications").update({"is_verified": True}).eq("id", stored_otp["id"]).execute()
        
        return True
        
    except Exception as e:
        print(f"Failed to verify OTP: {e}")
        return False


async def register_or_login_user(phone: str) -> UserResponse:
    """Register a new user or return existing user."""
    # Check if user already exists in signup_users table
    response = supabase.table("signup_users").select("*").eq("phone_number", phone).execute()
    
    if response.data:
        user_data = response.data[0]
        # Convert signup_users format to UserResponse format
        return UserResponse(
            id=str(user_data["id"]),
            phone=user_data["phone_number"],
            user_id=user_data.get("user_id", generate_16digit_id()),  # Generate if not exists
            created_at=user_data["created_at"]
        )
    
    # Create new user with unique 16-digit ID
    user_id = generate_16digit_id()
    
    # Ensure uniqueness of user_id (check both tables)
    while True:
        existing_signup = supabase.table("signup_users").select("user_id").eq("user_id", user_id).execute()
        if not existing_signup.data:
            break
        user_id = generate_16digit_id()
    
    # Create user data for signup_users table
    user_data = {
        "full_name": "User",  # Default name, can be updated later
        "email": f"{phone}@temp.com",  # Temporary email
        "phone_number": phone,
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    response = supabase.table("signup_users").insert(user_data).execute()
    
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    created_user = response.data[0]
    return UserResponse(
        id=str(created_user["id"]),
        phone=created_user["phone_number"],
        user_id=created_user["user_id"],
        created_at=created_user["created_at"]
    )


async def get_user_by_user_id(user_id: str) -> Optional[UserResponse]:
    """Fetch user by their 16-digit user ID."""
    response = supabase.table("signup_users").select("*").eq("user_id", user_id).execute()
    if response.data:
        user_data = response.data[0]
        return UserResponse(
            id=str(user_data["id"]),
            phone=user_data["phone_number"],
            user_id=user_data["user_id"],
            created_at=user_data["created_at"]
        )
    return None


async def get_user_public_key(user_id: str) -> Optional[bytes]:
    """Get user's public key for encryption."""
    # First get the user's primary key from signup_users
    user_response = supabase.table("signup_users").select("id").eq("user_id", user_id).execute()
    if not user_response.data:
        return None
    
    user_pk = user_response.data[0]["id"]
    
    # Get the active public key from user_keys table
    response = supabase.table("user_keys").select("pq_kem_public").eq("user_pk", user_pk).eq("is_active", True).execute()
    if response.data:
        import base64
        return base64.b64decode(response.data[0]["pq_kem_public"])
    return None


async def get_user_private_key(user_id: str) -> Optional[bytes]:
    """Get user's private key for decryption (internal use only)."""
    # Note: Private keys should NEVER be stored in the database for security reasons.
    # This function is kept for compatibility but will always return None.
    # Private keys should be generated and stored locally on the client side.
    print("Warning: Private keys should not be stored in database for security reasons")
    return None


async def signup_user(signup_data: SignupRequest) -> dict:
    """Create a new user account with full signup information."""
    try:
        # Validate phone number format
        formatted_phone = format_phone_number(signup_data.phone_number)
        if not validate_phone_number(formatted_phone):
            return {
                "success": False,
                "message": "Invalid phone number format",
                "error_code": "INVALID_PHONE"
            }
        
        # Check if user already exists with this email or phone
        existing_email = supabase.table("signup_users").select("*").eq("email", signup_data.email).execute()
        if existing_email.data:
            return {
                "success": False,
                "message": "User with this email already exists",
                "error_code": "EMAIL_EXISTS"
            }
        
        existing_phone = supabase.table("signup_users").select("*").eq("phone_number", formatted_phone).execute()
        if existing_phone.data:
            return {
                "success": False,
                "message": "User with this phone number already exists",
                "error_code": "PHONE_EXISTS"
            }
        
        # Generate unique user_id
        user_id = generate_16digit_id()
        while True:
            existing_user_id = supabase.table("signup_users").select("user_id").eq("user_id", user_id).execute()
            if not existing_user_id.data:
                break
            user_id = generate_16digit_id()
        
        # Create user data
        user_data = {
            "full_name": signup_data.full_name,
            "email": signup_data.email,
            "phone_number": formatted_phone,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        # Insert user into database
        response = supabase.table("signup_users").insert(user_data).execute()
        
        if not response.data:
            return {
                "success": False,
                "message": "Failed to create user account",
                "error_code": "DATABASE_ERROR"
            }
        
        created_user = response.data[0]
        return {
            "success": True,
            "message": "User account created successfully",
            "user": {
                "id": str(created_user["id"]),
                "full_name": created_user["full_name"],
                "email": created_user["email"],
                "phone_number": created_user["phone_number"],
                "user_id": created_user["user_id"],
                "created_at": created_user["created_at"]
            }
        }
        
    except Exception as e:
        print(f"Signup error: {e}")
        return {
            "success": False,
            "message": "Internal server error during signup",
            "error_code": "INTERNAL_ERROR"
        }


# Password utility functions
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


# Incognito mode password functions
async def check_user_has_incognito_password(user_id: str) -> bool:
    """Check if user has set an incognito mode password"""
    try:
        response = supabase.table("signup_users").select("password").eq("user_id", user_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]["password"] is not None and response.data[0]["password"] != ""
        return False
    except Exception as e:
        print(f"Error checking incognito password: {e}")
        return False


async def set_incognito_password(user_id: str, password: str) -> dict:
    """Set incognito mode password for user"""
    try:
        # Hash the password
        hashed_password = hash_password(password)
        
        # Update user's password in database
        response = supabase.table("signup_users").update({
            "password": hashed_password
        }).eq("user_id", user_id).execute()
        
        if response.data:
            return {
                "success": True,
                "message": "Incognito password set successfully"
            }
        else:
            return {
                "success": False,
                "message": "Failed to set incognito password"
            }
    except Exception as e:
        print(f"Error setting incognito password: {e}")
        return {
            "success": False,
            "message": "Failed to set incognito password",
            "error": str(e)
        }


async def verify_incognito_password(user_id: str, password: str) -> bool:
    """Verify incognito mode password for user"""
    try:
        response = supabase.table("signup_users").select("password").eq("user_id", user_id).execute()
        if response.data and len(response.data) > 0:
            stored_password = response.data[0]["password"]
            if stored_password:
                return verify_password(password, stored_password)
        return False
    except Exception as e:
        print(f"Error verifying incognito password: {e}")
        return False