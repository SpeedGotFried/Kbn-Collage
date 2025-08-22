# OTP Sender Changes

## Overview
The OTP SMS sending functionality has been moved from `auth.py` to a separate `otp_sender.py` module that uses Twilio API for sending SMS messages.

## Changes Made

### 1. New File: `otp_sender.py`
- Contains the `send_otp_sms()` function
- Uses Twilio API for SMS delivery
- Includes phone number formatting and validation
- Has fallback mechanisms for development mode

### 2. Modified File: `auth.py`
- Removed old SMS configuration variables
- Removed old `send_otp_sms()` function
- Added import for `otp_sender` module
- All other functionality remains unchanged

### 3. Updated Dependencies: `requirements.txt`
- Added `twilio==8.10.0` dependency

## Environment Variables Required

Create a `.env` file in the backend directory with:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Twilio SMS Configuration (for OTP sending)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## How to Get Twilio Credentials

1. **Sign up at**: https://www.twilio.com/
2. **Get Account SID and Auth Token** from your Twilio Console
3. **Get a Phone Number** for sending SMS (verify it first)
4. **Add the credentials** to your `.env` file

## Development Mode

If Twilio is not configured, the system will:
- Log OTPs to console
- Continue authentication flow
- Not break existing functionality

## Benefits of This Change

1. **Separation of Concerns**: SMS logic is now isolated
2. **Easier Maintenance**: SMS configuration is centralized
3. **Better Error Handling**: Twilio-specific error handling
4. **Flexibility**: Easy to switch SMS providers in the future
5. **No Breaking Changes**: All existing functionality preserved

## Testing

1. Install dependencies: `pip install -r requirements.txt`
2. Set up environment variables
3. Test OTP sending: The system will use Twilio if configured, or fall back to console logging
