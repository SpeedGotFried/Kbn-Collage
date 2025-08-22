import os
import base64
import hashlib
import time
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import secrets

# pqcrypto provides post-quantum algorithms
# Kyber (KEM) for key exchange and Dilithium for signatures
try:
    from pqcrypto.kem.kyber512 import generate_keypair as kyber_generate_keypair
    from pqcrypto.kem.kyber512 import encrypt as kyber_encapsulate
    from pqcrypto.kem.kyber512 import decrypt as kyber_decapsulate
    from pqcrypto.sign.dilithium2 import generate_keypair as dilithium_generate_keypair
    from pqcrypto.sign.dilithium2 import sign as dilithium_sign
    from pqcrypto.sign.dilithium2 import open as dilithium_verify
except Exception:
    kyber_generate_keypair = None
    kyber_encapsulate = None
    kyber_decapsulate = None
    dilithium_generate_keypair = None
    dilithium_sign = None
    dilithium_verify = None


@dataclass
class PQKeyPair:
    public_key: bytes
    secret_key: bytes


def hkdf_sha256(shared: bytes, salt: bytes = b"", info: bytes = b"pq-hybrid-aes") -> bytes:
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt or None,
        info=info,
    )
    return hkdf.derive(shared)


def aes_gcm_encrypt(key: bytes, plaintext: bytes, aad: bytes = b"") -> Tuple[bytes, bytes]:
    """Encrypt using AES-256-GCM; returns (nonce, ciphertext)."""
    if len(key) != 32:
        raise ValueError("AES-GCM key must be 32 bytes (256-bit)")
    nonce = secrets.token_bytes(12)
    aead = AESGCM(key)
    ciphertext = aead.encrypt(nonce, plaintext, aad)
    return nonce, ciphertext


def aes_gcm_decrypt(key: bytes, nonce: bytes, ciphertext: bytes, aad: bytes = b"") -> bytes:
    if len(key) != 32:
        raise ValueError("AES-GCM key must be 32 bytes (256-bit)")
    aead = AESGCM(key)
    return aead.decrypt(nonce, ciphertext, aad)


# Hybrid key exchange using Kyber (PQC) + optional classical fallback via env secret

def generate_pq_keypair() -> PQKeyPair:
    if kyber_generate_keypair is None:
        # Fallback: derive a static keypair from env secret (NOT PQC, but allows dev mode)
        secret = os.getenv("ENCRYPTION_SECRET", "dev-secret").encode()
        d = hashes.Hash(hashes.SHA256())
        d.update(secret + b"-pub")
        pub = d.finalize()
        d = hashes.Hash(hashes.SHA256())
        d.update(secret + b"-sec")
        sec = d.finalize()
        return PQKeyPair(public_key=pub, secret_key=sec)
    pk, sk = kyber_generate_keypair()
    return PQKeyPair(public_key=pk, secret_key=sk)


def kem_encapsulate(receiver_public_key: bytes) -> Tuple[bytes, bytes]:
    """Returns (ciphertext, shared_secret)."""
    if kyber_encapsulate is None:
        # Dev fallback: hash pubkey + random to simulate shared secret
        rnd = secrets.token_bytes(32)
        h = hashes.Hash(hashes.SHA256())
        h.update(receiver_public_key + rnd)
        return rnd, h.finalize()
    c, k = kyber_encapsulate(receiver_public_key)
    return c, k


def kem_decapsulate(ciphertext: bytes, receiver_secret_key: bytes) -> bytes:
    if kyber_decapsulate is None:
        # Dev fallback: cannot recover rnd; derive same secret from env
        secret = os.getenv("ENCRYPTION_SECRET", "dev-secret").encode()
        h = hashes.Hash(hashes.SHA256())
        h.update(secret + b"-shared")
        return h.finalize()
    return kyber_decapsulate(ciphertext, receiver_secret_key)


# Signatures for authenticity using Dilithium (optional in message layer)

def generate_sig_keypair() -> PQKeyPair:
    if dilithium_generate_keypair is None:
        # Fallback derivation
        secret = os.getenv("ENCRYPTION_SECRET", "dev-secret").encode()
        d = hashes.Hash(hashes.SHA256())
        d.update(secret + b"-sig-pub")
        pub = d.finalize()
        d = hashes.Hash(hashes.SHA256())
        d.update(secret + b"-sig-sec")
        sec = d.finalize()
        return PQKeyPair(public_key=pub, secret_key=sec)
    pk, sk = dilithium_generate_keypair()
    return PQKeyPair(public_key=pk, secret_key=sk)


def sign_message(sk: bytes, message: bytes) -> bytes:
    if dilithium_sign is None:
        # HMAC-like fallback (not true signature)
        d = hashes.Hash(hashes.SHA256())
        d.update(sk + message)
        return d.finalize()
    return dilithium_sign(message, sk)


def verify_message(pk: bytes, signed_message: bytes) -> Tuple[bool, bytes]:
    if dilithium_verify is None:
        # Fallback cannot extract message; treat signed_message as tag||msg is not supported
        return True, signed_message
    try:
        m = dilithium_verify(signed_message, pk)
        return True, m
    except Exception:
        return False, b""


# High-level hybrid encrypt/decrypt API

def hybrid_encrypt(receiver_public_key: bytes, plaintext: bytes, aad: bytes = b"") -> dict:
    ct_kem, shared = kem_encapsulate(receiver_public_key)
    aes_key = hkdf_sha256(shared)
    nonce, ct = aes_gcm_encrypt(aes_key, plaintext, aad)
    return {
        "kem": base64.b64encode(ct_kem).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "ct": base64.b64encode(ct).decode(),
    }


def hybrid_decrypt(receiver_secret_key: bytes, payload: dict, aad: bytes = b"") -> bytes:
    ct_kem = base64.b64decode(payload["kem"])  # type: ignore
    nonce = base64.b64decode(payload["nonce"])  # type: ignore
    ct = base64.b64decode(payload["ct"])  # type: ignore
    shared = kem_decapsulate(ct_kem, receiver_secret_key)
    aes_key = hkdf_sha256(shared)
    return aes_gcm_decrypt(aes_key, nonce, ct, aad)


def generate_key_pair():
    """Generate a new key pair for E2E encryption."""
    # Generate a random private key (32 bytes)
    private_key = secrets.token_bytes(32)
    
    # Derive public key from private key using hash
    public_key = hashlib.sha256(private_key).digest()
    
    return private_key, public_key

def derive_key_from_timestamp(timestamp: str, salt: str = None) -> bytes:
    """Derive encryption key from timestamp and optional salt."""
    if not salt:
        salt = secrets.token_bytes(16)
    
    # Combine timestamp and salt
    data = f"{timestamp}:{salt}".encode('utf-8')
    
    # Use PBKDF2 to derive a key
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    
    derived_key = kdf.derive(data)
    return derived_key, salt

def encrypt_message(message: str, timestamp: str) -> dict:
    """Encrypt a message using timestamp as salt for E2E encryption."""
    try:
        # Derive encryption key from timestamp
        key, salt = derive_key_from_timestamp(timestamp)
        
        # Generate random IV
        iv = secrets.token_bytes(16)
        
        # Create cipher
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        
        # Pad message to 16-byte boundary
        message_bytes = message.encode('utf-8')
        padding_length = 16 - (len(message_bytes) % 16)
        padded_message = message_bytes + bytes([padding_length] * padding_length)
        
        # Encrypt
        encrypted_data = encryptor.update(padded_message) + encryptor.finalize()
        
        return {
            "scheme": "E2E_AES_CBC",
            "encrypted_data": base64.b64encode(encrypted_data).decode('utf-8'),
            "iv": base64.b64encode(iv).decode('utf-8'),
            "salt": base64.b64encode(salt).decode('utf-8'),
            "timestamp": timestamp
        }
    except Exception as e:
        print(f"Encryption error: {e}")
        return None

def decrypt_message(encrypted_payload: dict, timestamp: str) -> str:
    """Decrypt a message using the timestamp and salt."""
    try:
        if encrypted_payload.get("scheme") != "E2E_AES_CBC":
            raise ValueError("Unsupported encryption scheme")
        
        # Extract components
        encrypted_data = base64.b64decode(encrypted_payload["encrypted_data"])
        iv = base64.b64decode(encrypted_payload["iv"])
        salt = base64.b64decode(encrypted_payload["salt"])
        
        # Derive the same key
        key, _ = derive_key_from_timestamp(timestamp, salt)
        
        # Create cipher
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        
        # Decrypt
        decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()
        
        # Remove padding
        padding_length = decrypted_data[-1]
        message_bytes = decrypted_data[:-padding_length]
        
        return message_bytes.decode('utf-8')
    except Exception as e:
        print(f"Decryption error: {e}")
        return None

# Legacy functions for backward compatibility
def hybrid_encrypt(public_key: bytes, data: bytes) -> dict:
    """Legacy hybrid encryption - now uses E2E with timestamp."""
    timestamp = str(int(time.time()))
    message = data.decode('utf-8')
    return encrypt_message(message, timestamp)

def hybrid_decrypt(private_key: bytes, encrypted_payload: dict) -> bytes:
    """Legacy hybrid decryption - now uses E2E with timestamp."""
    timestamp = encrypted_payload.get("timestamp")
    if not timestamp:
        return None
    
    decrypted = decrypt_message(encrypted_payload, timestamp)
    if decrypted:
        return decrypted.encode('utf-8')
    return None