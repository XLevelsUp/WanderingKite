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
      shoots: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          sub_category: string | null;
          created_at: string;
          slug: string | null;
          category_id: string | null;
          city_slug: string | null;
          client_names: string | null;
          story: string | null;
          shoot_date: string | null;
          cover_image_url: string | null;
          featured: boolean;
          status: 'draft' | 'published';
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          sub_category?: string | null;
          created_at?: string;
          slug?: string | null;
          category_id?: string | null;
          city_slug?: string | null;
          client_names?: string | null;
          story?: string | null;
          shoot_date?: string | null;
          cover_image_url?: string | null;
          featured?: boolean;
          status?: 'draft' | 'published';
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          sub_category?: string | null;
          created_at?: string;
          slug?: string | null;
          category_id?: string | null;
          city_slug?: string | null;
          client_names?: string | null;
          story?: string | null;
          shoot_date?: string | null;
          cover_image_url?: string | null;
          featured?: boolean;
          status?: 'draft' | 'published';
          updated_at?: string;
        };
      };
      photo_sections: {
        Row: {
          slug: string;
          name: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      photo_groups: {
        Row: {
          section_slug: string;
          slug: string;
          name: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          section_slug: string;
          slug: string;
          name: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          section_slug?: string;
          slug?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      photo_categories: {
        Row: {
          id: string;
          section_slug: string;
          group_slug: string;
          slug: string;
          name: string;
          subgroup: string | null;
          intro: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_slug: string;
          group_slug: string;
          slug: string;
          name: string;
          subgroup?: string | null;
          intro?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_slug?: string;
          group_slug?: string;
          slug?: string;
          name?: string;
          subgroup?: string | null;
          intro?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      photo_cities: {
        Row: {
          slug: string;
          name: string;
          state: string;
          intro: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          state: string;
          intro?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          state?: string;
          intro?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gallery_images: {
        Row: {
          id: string;
          shoot_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          shoot_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          shoot_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
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
          pricingPlans: Json;
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
          pricingPlans?: Json;
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
          pricingPlans?: Json;
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
