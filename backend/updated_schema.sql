DO $$ 
 BEGIN 
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'friend_status') THEN 
     CREATE TYPE friend_status AS ENUM ('pending','accepted','declined'); 
   END IF; 
 END$$; 
 
 -- ---------- 2) USERS (signups/profile) ---------- 
 -- If you already have signup_users, keep it; this version adds columns you need. 
 CREATE TABLE IF NOT EXISTS signup_users ( 
   id           SERIAL PRIMARY KEY, 
   full_name    TEXT NOT NULL, 
   email        TEXT UNIQUE,                       -- optional if you use phone-only OTP 
   phone_number TEXT NOT NULL UNIQUE,              -- phone login/OTP 
   display_name TEXT, 
   user_id      CHAR(16) UNIQUE,                   -- 16-digit numeric code (set by trigger) 
   password     TEXT,                              -- for incognito mode functionality 
   created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
   updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
   -- enforce numeric-only 16 chars if provided manually 
   CONSTRAINT chk_user_id_numeric_only CHECK (user_id IS NULL OR user_id ~ '^[0-9]{16}$') 
 ); 
 
 -- helpful index for lookups by phone 
 CREATE INDEX IF NOT EXISTS idx_signup_users_phone ON signup_users(phone_number); 
 
 -- ---------- 3) USER KEYS (public crypto material only) ---------- 
 -- Store only PUBLIC keys here (never private keys). 
 CREATE TABLE IF NOT EXISTS user_keys ( 
   id                 SERIAL PRIMARY KEY, 
   user_pk            INT NOT NULL REFERENCES signup_users(id) ON DELETE CASCADE, 
   pq_kem_public      TEXT NOT NULL,  -- e.g., Kyber public key (base64/hex) 
   pq_sig_public      TEXT,           -- e.g., Dilithium public key (optional) 
   is_active          BOOLEAN NOT NULL DEFAULT TRUE, 
   created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW() 
 ); 
 
 CREATE INDEX IF NOT EXISTS idx_user_keys_user_pk ON user_keys(user_pk); 
 CREATE UNIQUE INDEX IF NOT EXISTS uq_user_keys_active 
   ON user_keys(user_pk) WHERE (is_active); 
 
 -- ---------- 4) FRIEND REQUESTS ---------- 
 CREATE TABLE IF NOT EXISTS friend_requests ( 
   id             SERIAL PRIMARY KEY, 
   sender_id      INT NOT NULL REFERENCES signup_users(id) ON DELETE CASCADE, 
   receiver_id    INT NOT NULL REFERENCES signup_users(id) ON DELETE CASCADE, 
   status         friend_status NOT NULL DEFAULT 'pending', 
   created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
   responded_at   TIMESTAMPTZ 
 ); 
 
 -- prevent self-requests 
 ALTER TABLE friend_requests 
   ADD CONSTRAINT chk_friend_requests_not_self 
   CHECK (sender_id <> receiver_id); 
 
 -- only one open request in either direction between same users 
 CREATE UNIQUE INDEX IF NOT EXISTS uq_friend_requests_pair_direction 
   ON friend_requests (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)) 
   WHERE (status = 'pending'); 
 
 CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_pending 
   ON friend_requests (receiver_id) WHERE (status = 'pending'); 
 
 -- ---------- 5) FRIENDS (accepted relations; single row per pair) ---------- 
 CREATE TABLE IF NOT EXISTS friends ( 
   id          SERIAL PRIMARY KEY, 
   user_id     INT NOT NULL REFERENCES signup_users(id) ON DELETE CASCADE, 
   friend_id   INT NOT NULL REFERENCES signup_users(id) ON DELETE CASCADE, 
   created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() 
 ); 
 
 -- prevent self-friend 
 ALTER TABLE friends 
   ADD CONSTRAINT chk_friends_not_self 
   CHECK (user_id <> friend_id); 
 
 -- ensure only one row for a pair (order-independent) 
 CREATE UNIQUE INDEX IF NOT EXISTS uq_friends_pair_unique 
   ON friends (LEAST(user_id, friend_id), GREATEST(user_id, friend_id)); 
 
 -- ---------- 6) MESSAGES (E2EE ciphertext only) ---------- 
 CREATE TABLE IF NOT EXISTS messages ( 
   id                 SERIAL PRIMARY KEY, 
   sender_id          INT NOT NULL REFERENCES signup_users(id) ON DELETE CASCADE, 
   receiver_id        INT NOT NULL REFERENCES signup_users(id) ON DELETE CASCADE, 
   encrypted_content  JSONB NOT NULL,   -- e.g., {"ct":"...","nonce":"...","tag":"..."} 
   -- optional extra metadata (non-sensitive) 
   ratchet_counter    INT,              -- if you implement ratchets later 
   created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
   delivered_at       TIMESTAMPTZ, 
   read_at            TIMESTAMPTZ 
 ); 
 
 CREATE INDEX IF NOT EXISTS idx_messages_peerpair_time 
   ON messages (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at); 
 
 -- ---------- 7) ATTACHMENTS (optional but handy) ---------- 
 CREATE TABLE IF NOT EXISTS message_attachments ( 
   id            SERIAL PRIMARY KEY, 
   message_id    INT NOT NULL REFERENCES messages(id) ON DELETE CASCADE, 
   storage_path  TEXT NOT NULL,      -- Supabase Storage path / URL 
   cipher_meta   JSONB NOT NULL,     -- {"keyRef":"...", "nonce":"...", "tag":"..."} (no plaintext) 
   created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() 
 ); 
 
 CREATE INDEX IF NOT EXISTS idx_attachments_msg ON message_attachments(message_id); 
 
 -- ---------- 8) OTP VERIFICATIONS (for phone OTP flow) ---------- 
 CREATE TABLE IF NOT EXISTS otp_verifications ( 
   id            SERIAL PRIMARY KEY, 
   phone_number  TEXT NOT NULL, 
   otp           TEXT NOT NULL, 
   is_verified   BOOLEAN NOT NULL DEFAULT FALSE, 
   created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
   expires_at    TIMESTAMPTZ 
 ); 
 
 CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_is_verified ON otp_verifications(is_verified);

-- ---------- 9) TRIGGERS AND FUNCTIONS ----------
-- Function to automatically create friendship when friend request is accepted
CREATE OR REPLACE FUNCTION friend_request_to_friendship() 
RETURNS TRIGGER AS $$ 
DECLARE 
  u1 INT; 
  u2 INT; 
BEGIN 
  IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN 
    u1 := LEAST(NEW.sender_id, NEW.receiver_id); 
    u2 := GREATEST(NEW.sender_id, NEW.receiver_id); 

    INSERT INTO friends (user_id, friend_id) 
    VALUES (u1, u2) 
    ON CONFLICT (LEAST(user_id, friend_id), GREATEST(user_id, friend_id)) DO NOTHING; 

    NEW.responded_at := NOW(); 
  ELSIF NEW.status IN ('declined') AND OLD.status <> 'declined' THEN 
    NEW.responded_at := NOW(); 
  END IF; 

  RETURN NEW; 
END; $$ LANGUAGE plpgsql; 

DROP TRIGGER IF EXISTS trg_friend_requests_accept ON friend_requests; 
CREATE TRIGGER trg_friend_requests_accept 
AFTER UPDATE ON friend_requests 
FOR EACH ROW EXECUTE FUNCTION friend_request_to_friendship(); 

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at := NOW(); 
  RETURN NEW; 
END; $$ LANGUAGE plpgsql; 

DROP TRIGGER IF EXISTS trg_signup_users_updated ON signup_users; 
CREATE TRIGGER trg_signup_users_updated 
BEFORE UPDATE ON signup_users 
FOR EACH ROW EXECUTE FUNCTION set_updated_at(); 

-- Function to automatically generate 16-digit user_id
CREATE OR REPLACE FUNCTION generate_user_id() 
RETURNS TRIGGER AS $$ 
BEGIN 
  -- If user_id is not provided, generate a 16-digit number 
  IF NEW.user_id IS NULL THEN 
    NEW.user_id := ( 
      FLOOR(RANDOM() * 9000000000000000) + 1000000000000000 
    )::BIGINT; 
  END IF; 

  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql; 

-- Trigger to set user_id on signup_users insert
DROP TRIGGER IF EXISTS set_user_id ON signup_users; 
CREATE TRIGGER set_user_id 
BEFORE INSERT ON signup_users 
FOR EACH ROW 
EXECUTE FUNCTION generate_user_id();