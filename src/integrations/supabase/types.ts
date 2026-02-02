export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string
          email: string
          zip_code: string
          user_type: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          zip_code: string
          user_type: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          zip_code?: string
          user_type?: string
          created_at?: string
        }
        Relationships: []
      }
      available_shares: {
        Row: {
          id: string
          farm_id: string
          animal_type: Database["public"]["Enums"]["animal_type"]
          portion: Database["public"]["Enums"]["share_portion"]
          price: number
          weight_estimate: string | null
          quantity_available: number
          next_available_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          animal_type?: Database["public"]["Enums"]["animal_type"]
          portion: Database["public"]["Enums"]["share_portion"]
          price: number
          weight_estimate?: string | null
          quantity_available?: number
          next_available_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          animal_type?: Database["public"]["Enums"]["animal_type"]
          portion?: Database["public"]["Enums"]["share_portion"]
          price?: number
          weight_estimate?: string | null
          quantity_available?: number
          next_available_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "available_shares_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          }
        ]
      }
      buyer_waitlist: {
        Row: {
          id: string
          user_id: string
          farm_id: string
          desired_portion: Database["public"]["Enums"]["share_portion"]
          animal_type: Database["public"]["Enums"]["animal_type"]
          zip_code: string | null
          max_distance: number | null
          allow_contact: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          farm_id: string
          desired_portion: Database["public"]["Enums"]["share_portion"]
          animal_type?: Database["public"]["Enums"]["animal_type"]
          zip_code?: string | null
          max_distance?: number | null
          allow_contact?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          farm_id?: string
          desired_portion?: Database["public"]["Enums"]["share_portion"]
          animal_type?: Database["public"]["Enums"]["animal_type"]
          zip_code?: string | null
          max_distance?: number | null
          allow_contact?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_waitlist_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          }
        ]
      }
      farmer_role_requests: {
        Row: {
          id: string
          user_id: string
          status: Database["public"]["Enums"]["farmer_request_status"]
          note: string | null
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: Database["public"]["Enums"]["farmer_request_status"]
          note?: string | null
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: Database["public"]["Enums"]["farmer_request_status"]
          note?: string | null
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      farms: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          location: string
          zip_code: string
          latitude: number | null
          longitude: number | null
          image_url: string | null
          badge: string | null
          is_grass_fed: boolean | null
          is_organic: boolean | null
          rating: number | null
          review_count: number | null
          is_active: boolean | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          location: string
          zip_code: string
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          badge?: string | null
          is_grass_fed?: boolean | null
          is_organic?: boolean | null
          rating?: number | null
          review_count?: number | null
          is_active?: boolean | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          location?: string
          zip_code?: string
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          badge?: string | null
          is_grass_fed?: boolean | null
          is_organic?: boolean | null
          rating?: number | null
          review_count?: number | null
          is_active?: boolean | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          membership_type: string
          tier: string | null
          price_paid: number
          stripe_subscription_id: string | null
          starts_at: string
          expires_at: string
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          membership_type: string
          tier?: string | null
          price_paid: number
          stripe_subscription_id?: string | null
          starts_at?: string
          expires_at: string
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          membership_type?: string
          tier?: string | null
          price_paid?: number
          stripe_subscription_id?: string | null
          starts_at?: string
          expires_at?: string
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string | null
          full_name: string | null
          phone: string | null
          zip_code: string | null
          avatar_url: string | null
          is_farmer: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          zip_code?: string | null
          avatar_url?: string | null
          is_farmer?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          zip_code?: string | null
          avatar_url?: string | null
          is_farmer?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      share_purchases: {
        Row: {
          id: string
          buyer_id: string
          share_id: string
          farm_id: string
          portion: Database["public"]["Enums"]["share_portion"]
          price_paid: number
          status: Database["public"]["Enums"]["purchase_status"]
          stripe_payment_intent_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          share_id: string
          farm_id: string
          portion: Database["public"]["Enums"]["share_portion"]
          price_paid: number
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          share_id?: string
          farm_id?: string
          portion?: Database["public"]["Enums"]["share_portion"]
          price_paid?: number
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_purchases_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_purchases_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "available_shares"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      request_farmer_role: {
        Args: {
          _note?: string
        }
        Returns: {
          id: string
          user_id: string
          status: Database["public"]["Enums"]["farmer_request_status"]
          note: string | null
          admin_note: string | null
          created_at: string
          updated_at: string
        }
      }
      review_farmer_role_request: {
        Args: {
          _request_id: string
          _decision: Database["public"]["Enums"]["farmer_request_status"]
          _admin_note?: string
        }
        Returns: {
          id: string
          user_id: string
          status: Database["public"]["Enums"]["farmer_request_status"]
          note: string | null
          admin_note: string | null
          created_at: string
          updated_at: string
        }
      }
    }
    Enums: {
      animal_type: "beef" | "pork"
      app_role: "admin" | "farmer" | "buyer"
      farmer_request_status: "pending" | "approved" | "rejected"
      purchase_status: "pending" | "confirmed" | "completed" | "cancelled"
      share_portion: "1/8" | "1/4" | "1/2" | "3/4" | "whole"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Row"]

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Insert"]

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName]["Update"]

export type Enums<
  EnumName extends keyof PublicSchema["Enums"]
> = PublicSchema["Enums"][EnumName]
