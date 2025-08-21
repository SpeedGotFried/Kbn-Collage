#!/usr/bin/env python3
"""
Database setup script to create all required tables.
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_KEY", "")

if not supabase_url or not supabase_key:
    print("❌ SUPABASE_URL and SUPABASE_KEY must be set")
    exit(1)

# Create Supabase client
supabase: Client = create_client(supabase_url, supabase_key)

# Read and execute schema
with open('updated_schema.sql', 'r') as f:
    schema_sql = f.read()

print("📊 Setting up database schema...")

try:
    # Execute the schema SQL
    result = supabase.rpc('exec_sql', {'sql': schema_sql})
    print("✅ Database schema applied successfully!")
except Exception as e:
    print(f"❌ Error applying schema: {e}")
    print("\n🔧 Trying alternative approach...")
    
    # Split schema into individual statements and execute them
    statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
    
    for i, statement in enumerate(statements):
        if statement:
            try:
                print(f"Executing statement {i+1}/{len(statements)}...")
                result = supabase.rpc('exec_sql', {'sql': statement})
                print(f"✅ Statement {i+1} executed successfully")
            except Exception as stmt_error:
                print(f"⚠️ Statement {i+1} failed: {stmt_error}")
                # Continue with other statements
                continue

print("\n🔍 Verifying tables exist...")

# Check if tables exist
tables_to_check = ['signup_users', 'user_keys', 'friend_requests', 'friends', 'messages', 'message_attachments', 'otp_verifications']

for table in tables_to_check:
    try:
        result = supabase.table(table).select('*').limit(1).execute()
        print(f"✅ Table '{table}' exists and is accessible")
    except Exception as e:
        print(f"❌ Table '{table}' not accessible: {e}")

print("\n🎉 Database setup complete!")