export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      branches: {
        Row: {
          id: string;
          name: string;
          location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          address: string | null;
          govt_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          govt_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          address?: string | null;
          govt_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      equipment: {
        Row: {
          id: string;
          name: string;
          serial_number: string;
          category_id: string | null;
          branch_id: string | null;
          status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'LOST';
          rental_price: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          serial_number: string;
          category_id?: string | null;
          branch_id?: string | null;
          status?: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'LOST';
          rental_price: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          serial_number?: string;
          category_id?: string | null;
          branch_id?: string | null;
          status?: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'LOST';
          rental_price?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
          branch_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
          branch_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
          branch_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rental_items: {
        Row: {
          id: string;
          rental_id: string;
          equipment_id: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          rental_id: string;
          equipment_id: string;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          rental_id?: string;
          equipment_id?: string;
          price?: number;
          created_at?: string;
        };
      };
      rentals: {
        Row: {
          id: string;
          client_id: string;
          staff_id: string | null;
          start_date: string;
          end_date: string;
          actual_return_date: string | null;
          status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          staff_id?: string | null;
          start_date: string;
          end_date: string;
          actual_return_date?: string | null;
          status?: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
          total_amount: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          staff_id?: string | null;
          start_date?: string;
          end_date?: string;
          actual_return_date?: string | null;
          status?: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: {
          user_id: string;
        };
        Returns: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
      };
    };
    Enums: {
      user_role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
      equipment_status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'LOST';
      rental_status:
        | 'PENDING'
        | 'ACTIVE'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'OVERDUE';
    };
  };
}
