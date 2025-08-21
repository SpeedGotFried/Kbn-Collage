export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      signup_users: {
        Row: {
          id: number
          full_name: string
          email: string | null
          phone_number: string
          display_name: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          full_name: string
          email?: string | null
          phone_number: string
          display_name?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          full_name?: string
          email?: string | null
          phone_number?: string
          display_name?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_keys: {
        Row: {
          id: number
          user_pk: number
          pq_kem_public: string
          pq_sig_public: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_pk: number
          pq_kem_public: string
          pq_sig_public?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_pk?: number
          pq_kem_public?: string
          pq_sig_public?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_keys_user_pk_fkey"
            columns: ["user_pk"]
            referencedRelation: "signup_users"
            referencedColumns: ["id"]
          }
        ]
      }
      friend_requests: {
        Row: {
          id: number
          sender_id: number
          receiver_id: number
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: number
          sender_id: number
          receiver_id: number
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: number
          sender_id?: number
          receiver_id?: number
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          responded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "signup_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "signup_users"
            referencedColumns: ["id"]
          }
        ]
      }
      friends: {
        Row: {
          id: number
          user_id: number
          friend_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          friend_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          friend_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "signup_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            referencedRelation: "signup_users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: number
          sender_id: number
          receiver_id: number
          encrypted_content: Json
          ratchet_counter: number | null
          created_at: string
          delivered_at: string | null
          read_at: string | null
        }
        Insert: {
          id?: number
          sender_id: number
          receiver_id: number
          encrypted_content: Json
          ratchet_counter?: number | null
          created_at?: string
          delivered_at?: string | null
          read_at?: string | null
        }
        Update: {
          id?: number
          sender_id?: number
          receiver_id?: number
          encrypted_content?: Json
          ratchet_counter?: number | null
          created_at?: string
          delivered_at?: string | null
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "signup_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "signup_users"
            referencedColumns: ["id"]
          }
        ]
      }
      message_attachments: {
        Row: {
          id: number
          message_id: number
          storage_path: string
          cipher_meta: Json
          created_at: string
        }
        Insert: {
          id?: number
          message_id: number
          storage_path: string
          cipher_meta: Json
          created_at?: string
        }
        Update: {
          id?: number
          message_id?: number
          storage_path?: string
          cipher_meta?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "messages"
            referencedColumns: ["id"]
          }
        ]
      }
      otp_verifications: {
        Row: {
          id: number
          phone_number: string
          otp: string
          is_verified: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: number
          phone_number: string
          otp: string
          is_verified?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: number
          phone_number?: string
          otp?: string
          is_verified?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      friend_status: 'pending' | 'accepted' | 'declined'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type SignupUser = Database['public']['Tables']['signup_users']['Row'];
export type SignupUserInsert = Database['public']['Tables']['signup_users']['Insert'];
export type SignupUserUpdate = Database['public']['Tables']['signup_users']['Update'];

export type UserKey = Database['public']['Tables']['user_keys']['Row'];
export type UserKeyInsert = Database['public']['Tables']['user_keys']['Insert'];
export type UserKeyUpdate = Database['public']['Tables']['user_keys']['Update'];

export type FriendRequest = Database['public']['Tables']['friend_requests']['Row'];
export type FriendRequestInsert = Database['public']['Tables']['friend_requests']['Insert'];
export type FriendRequestUpdate = Database['public']['Tables']['friend_requests']['Update'];

export type Friend = Database['public']['Tables']['friends']['Row'];
export type FriendInsert = Database['public']['Tables']['friends']['Insert'];
export type FriendUpdate = Database['public']['Tables']['friends']['Update'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export type MessageAttachment = Database['public']['Tables']['message_attachments']['Row'];
export type MessageAttachmentInsert = Database['public']['Tables']['message_attachments']['Insert'];
export type MessageAttachmentUpdate = Database['public']['Tables']['message_attachments']['Update'];

export type OTPVerification = Database['public']['Tables']['otp_verifications']['Row'];
export type OTPVerificationInsert = Database['public']['Tables']['otp_verifications']['Insert'];
export type OTPVerificationUpdate = Database['public']['Tables']['otp_verifications']['Update'];

// Enum types
export type FriendStatus = Database['public']['Enums']['friend_status'];