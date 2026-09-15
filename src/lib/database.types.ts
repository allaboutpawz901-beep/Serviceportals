export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Checked In'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'
  | 'Waitlisted';

export type PaymentStatus =
  | 'Pending'
  | 'Authorized'
  | 'Paid'
  | 'Partially Paid'
  | 'Refunded'
  | 'Partially Refunded'
  | 'Failed'
  | 'Voided';

export type OrderStatus =
  | 'UNFULFILLED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type LMSStatus = 'Draft' | 'Published' | 'Archived';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          type: string;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          phone: string | null;
          email: string | null;
          capacity_per_hour: number;
          is_active: boolean;
          operating_hours: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          type?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          phone?: string | null;
          email?: string | null;
          capacity_per_hour?: number;
          is_active?: boolean;
          operating_hours?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          name?: string;
          type?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          phone?: string | null;
          email?: string | null;
          capacity_per_hour?: number;
          is_active?: boolean;
          operating_hours?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          organization_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          alt_phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          vip: boolean;
          total_spent: number;
          outstanding_balance: number;
          notes: string | null;
          preferred_contact_method: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          alt_phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          vip?: boolean;
          total_spent?: number;
          outstanding_balance?: number;
          notes?: string | null;
          preferred_contact_method?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          alt_phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          vip?: boolean;
          total_spent?: number;
          outstanding_balance?: number;
          notes?: string | null;
          preferred_contact_method?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pets: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          species: string;
          breed: string;
          gender: string | null;
          is_neutered_spayed: boolean;
          birth_date: string | null;
          age_approx: string | null;
          weight_lbs: number | null;
          color: string | null;
          photo_url: string | null;
          microchip_number: string | null;
          vaccinations_current: boolean;
          rabies_exp_date: string | null;
          dhpp_exp_date: string | null;
          bordetella_exp_date: string | null;
          allergies: string | null;
          behavioral_notes: string | null;
          grooming_instructions: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          name: string;
          species?: string;
          breed: string;
          gender?: string | null;
          is_neutered_spayed?: boolean;
          birth_date?: string | null;
          age_approx?: string | null;
          weight_lbs?: number | null;
          color?: string | null;
          photo_url?: string | null;
          microchip_number?: string | null;
          vaccinations_current?: boolean;
          rabies_exp_date?: string | null;
          dhpp_exp_date?: string | null;
          bordetella_exp_date?: string | null;
          allergies?: string | null;
          behavioral_notes?: string | null;
          grooming_instructions?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          name?: string;
          species?: string;
          breed?: string;
          gender?: string | null;
          is_neutered_spayed?: boolean;
          birth_date?: string | null;
          age_approx?: string | null;
          weight_lbs?: number | null;
          color?: string | null;
          photo_url?: string | null;
          microchip_number?: string | null;
          vaccinations_current?: boolean;
          rabies_exp_date?: string | null;
          dhpp_exp_date?: string | null;
          bordetella_exp_date?: string | null;
          allergies?: string | null;
          behavioral_notes?: string | null;
          grooming_instructions?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          role: string;
          avatar_url: string | null;
          is_active: boolean;
          commission_rate: number;
          hourly_rate: number;
          primary_location_id: string | null;
          specialties: string[] | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          role?: string;
          avatar_url?: string | null;
          is_active?: boolean;
          commission_rate?: number;
          hourly_rate?: number;
          primary_location_id?: string | null;
          specialties?: string[] | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          role?: string;
          avatar_url?: string | null;
          is_active?: boolean;
          commission_rate?: number;
          hourly_rate?: number;
          primary_location_id?: string | null;
          specialties?: string[] | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          base_price: number;
          duration_minutes: number;
          deposit_required: number;
          eligible_weight_max: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string;
          description?: string | null;
          base_price: number;
          duration_minutes?: number;
          deposit_required?: number;
          eligible_weight_max?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          base_price?: number;
          duration_minutes?: number;
          deposit_required?: number;
          eligible_weight_max?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          organization_id: string | null;
          location_id: string | null;
          customer_id: string | null;
          pet_id: string | null;
          staff_id: string | null;
          service_id: string | null;
          owner_name: string | null;
          pet_name: string | null;
          breed: string | null;
          service_name: string;
          appointment_date: string;
          start_time: string;
          duration_minutes: number;
          status: AppointmentStatus;
          payment_status: PaymentStatus;
          total_price: number;
          deposit_amount: number;
          tip_amount: number;
          check_in_time: string | null;
          check_out_time: string | null;
          notes: string | null;
          internal_groomer_notes: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          location_id?: string | null;
          customer_id?: string | null;
          pet_id?: string | null;
          staff_id?: string | null;
          service_id?: string | null;
          owner_name?: string | null;
          pet_name?: string | null;
          breed?: string | null;
          service_name: string;
          appointment_date?: string;
          start_time: string;
          duration_minutes?: number;
          status?: AppointmentStatus;
          payment_status?: PaymentStatus;
          total_price?: number;
          deposit_amount?: number;
          tip_amount?: number;
          check_in_time?: string | null;
          check_out_time?: string | null;
          notes?: string | null;
          internal_groomer_notes?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          location_id?: string | null;
          customer_id?: string | null;
          pet_id?: string | null;
          staff_id?: string | null;
          service_id?: string | null;
          owner_name?: string | null;
          pet_name?: string | null;
          breed?: string | null;
          service_name?: string;
          appointment_date?: string;
          start_time?: string;
          duration_minutes?: number;
          status?: AppointmentStatus;
          payment_status?: PaymentStatus;
          total_price?: number;
          deposit_amount?: number;
          tip_amount?: number;
          check_in_time?: string | null;
          check_out_time?: string | null;
          notes?: string | null;
          internal_groomer_notes?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          location_id: string | null;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          subtotal: number;
          tax: number;
          discount: number;
          shipping_cost: number;
          total_amount: number;
          fulfillment_status: OrderStatus;
          payment_status: PaymentStatus;
          shipping_carrier: string | null;
          tracking_number: string | null;
          shipping_method: string | null;
          shipping_address: Json | null;
          billing_address: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          location_id?: string | null;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          subtotal: number;
          tax?: number;
          discount?: number;
          shipping_cost?: number;
          total_amount: number;
          fulfillment_status?: OrderStatus;
          payment_status?: PaymentStatus;
          shipping_carrier?: string | null;
          tracking_number?: string | null;
          shipping_method?: string | null;
          shipping_address?: Json | null;
          billing_address?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          location_id?: string | null;
          customer_name?: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          subtotal?: number;
          tax?: number;
          discount?: number;
          shipping_cost?: number;
          total_amount?: number;
          fulfillment_status?: OrderStatus;
          payment_status?: PaymentStatus;
          shipping_carrier?: string | null;
          tracking_number?: string | null;
          shipping_method?: string | null;
          shipping_address?: Json | null;
          billing_address?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          sku: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          sku?: string | null;
          quantity?: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          sku?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          brand: string | null;
          category: string;
          cost_price: number;
          price: number;
          stock_quantity: number;
          reorder_level: number;
          unit: string;
          barcode: string | null;
          photo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          brand?: string | null;
          category?: string;
          cost_price?: number;
          price: number;
          stock_quantity?: number;
          reorder_level?: number;
          unit?: string;
          barcode?: string | null;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          name?: string;
          brand?: string | null;
          category?: string;
          cost_price?: number;
          price?: number;
          stock_quantity?: number;
          reorder_level?: number;
          unit?: string;
          barcode?: string | null;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          transaction_id: string;
          appointment_id: string | null;
          order_id: string | null;
          customer_id: string | null;
          amount: number;
          tip_amount: number;
          processing_fee: number;
          net_amount: number;
          payment_method: string;
          payment_provider: string;
          provider_transaction_id: string | null;
          status: string;
          card_brand: string | null;
          card_last4: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id?: string;
          appointment_id?: string | null;
          order_id?: string | null;
          customer_id?: string | null;
          amount: number;
          tip_amount?: number;
          processing_fee?: number;
          payment_method: string;
          payment_provider?: string;
          provider_transaction_id?: string | null;
          status?: string;
          card_brand?: string | null;
          card_last4?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          appointment_id?: string | null;
          order_id?: string | null;
          customer_id?: string | null;
          amount?: number;
          tip_amount?: number;
          processing_fee?: number;
          payment_method?: string;
          payment_provider?: string;
          provider_transaction_id?: string | null;
          status?: string;
          card_brand?: string | null;
          card_last4?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_id: string | null;
          recipient_name: string;
          recipient_email: string | null;
          recipient_phone: string | null;
          subtotal: number;
          tax: number;
          discount: number;
          total: number;
          amount_paid: number;
          balance_due: number;
          status: string;
          issue_date: string;
          due_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          customer_id?: string | null;
          recipient_name: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          subtotal: number;
          tax?: number;
          discount?: number;
          total: number;
          amount_paid?: number;
          status?: string;
          issue_date?: string;
          due_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          customer_id?: string | null;
          recipient_name?: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          subtotal?: number;
          tax?: number;
          discount?: number;
          total?: number;
          amount_paid?: number;
          status?: string;
          issue_date?: string;
          due_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lms_courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          level: string;
          duration_hours: number;
          thumbnail_url: string | null;
          description: string | null;
          instructor_name: string;
          status: LMSStatus;
          is_required_for_onboarding: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category: string;
          level?: string;
          duration_hours?: number;
          thumbnail_url?: string | null;
          description?: string | null;
          instructor_name?: string;
          status?: LMSStatus;
          is_required_for_onboarding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string;
          level?: string;
          duration_hours?: number;
          thumbnail_url?: string | null;
          description?: string | null;
          instructor_name?: string;
          status?: LMSStatus;
          is_required_for_onboarding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lms_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order_index?: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      lms_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          order_index: number;
          lesson_type: string;
          duration_minutes: number;
          video_url: string | null;
          content_markdown: string | null;
          attachments: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          order_index?: number;
          lesson_type?: string;
          duration_minutes?: number;
          video_url?: string | null;
          content_markdown?: string | null;
          attachments?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          order_index?: number;
          lesson_type?: string;
          duration_minutes?: number;
          video_url?: string | null;
          content_markdown?: string | null;
          attachments?: Json;
          created_at?: string;
        };
      };
      lms_enrollments: {
        Row: {
          id: string;
          course_id: string;
          staff_id: string;
          progress_percent: number;
          completed_lessons: string[];
          is_completed: boolean;
          completed_at: string | null;
          certificate_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          staff_id: string;
          progress_percent?: number;
          completed_lessons?: string[];
          is_completed?: boolean;
          completed_at?: string | null;
          certificate_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          staff_id?: string;
          progress_percent?: number;
          completed_lessons?: string[];
          is_completed?: boolean;
          completed_at?: string | null;
          certificate_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      dogs: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          breed: string;
          age: string | null;
          weight: string | null;
          gender: string | null;
          color: string | null;
          photo_url: string | null;
          vaccinations_current: boolean;
          rabies_exp_date: string | null;
          special_handling_notes: string | null;
          behavioral_notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string | null;
          dog_id: string | null;
          groomer_id: string | null;
          owner_name: string | null;
          dog_name: string | null;
          breed: string | null;
          service: string;
          service_price: string | null;
          deposit_amount: string | null;
          date: string;
          time: string;
          status: string;
          payment_status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      appointment_status_enum: AppointmentStatus;
      payment_status_enum: PaymentStatus;
      order_status_enum: OrderStatus;
      lms_status_enum: LMSStatus;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
