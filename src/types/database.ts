export type CarStatus = "available" | "reserved" | "sold";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type CarCategory =
  | "upcoming_units"
  | "port_units"
  | "showroom_stocks"
  | "exchange_offers"
  | "pre_orders";

export interface Database {
  public: {
    Tables: {
      admin_members: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cars: {
        Row: {
          id: string;
          slug: string;
          make: string;
          model: string;
          year: number;
          trim: string | null;
          price: number;
          currency: string;
          status: CarStatus;
          categories: CarCategory[];
          mileage: number | null;
          exterior_color: string | null;
          interior_color: string | null;
          transmission: string | null;
          fuel_type: string | null;
          engine: string | null;
          horsepower: number | null;
          drivetrain: string | null;
          body_type: string | null;
          doors: number | null;
          seats: number | null;
          vin: string | null;
          description: string | null;
          features: string[];
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          make: string;
          model: string;
          year: number;
          trim?: string | null;
          price: number;
          currency?: string;
          status?: CarStatus;
          categories?: CarCategory[];
          mileage?: number | null;
          exterior_color?: string | null;
          interior_color?: string | null;
          transmission?: string | null;
          fuel_type?: string | null;
          engine?: string | null;
          horsepower?: number | null;
          drivetrain?: string | null;
          body_type?: string | null;
          doors?: number | null;
          seats?: number | null;
          vin?: string | null;
          description?: string | null;
          features?: string[];
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          make?: string;
          model?: string;
          year?: number;
          trim?: string | null;
          price?: number;
          currency?: string;
          status?: CarStatus;
          categories?: CarCategory[];
          mileage?: number | null;
          exterior_color?: string | null;
          interior_color?: string | null;
          transmission?: string | null;
          fuel_type?: string | null;
          engine?: string | null;
          horsepower?: number | null;
          drivetrain?: string | null;
          body_type?: string | null;
          doors?: number | null;
          seats?: number | null;
          vin?: string | null;
          description?: string | null;
          features?: string[];
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      car_images: {
        Row: {
          id: string;
          car_id: string;
          url: string;
          storage_path: string;
          alt: string | null;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          url: string;
          storage_path: string;
          alt?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          url?: string;
          storage_path?: string;
          alt?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      news: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          image_url: string | null;
          image_path: string | null;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string;
          image_url?: string | null;
          image_path?: string | null;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          image_path?: string | null;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          message: string | null;
          status: AppointmentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          message?: string | null;
          status?: AppointmentStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          message?: string | null;
          status?: AppointmentStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          car_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      tour_scenes: {
        Row: {
          id: string;
          title: string;
          url: string;
          storage_path: string;
          width: number;
          height: number;
          sort_order: number;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          storage_path: string;
          width: number;
          height: number;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          storage_path?: string;
          width?: number;
          height?: number;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      tour_hotspots: {
        Row: {
          id: string;
          scene_id: string;
          target_scene_id: string;
          label: string | null;
          pitch: number;
          yaw: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          scene_id: string;
          target_scene_id: string;
          label?: string | null;
          pitch: number;
          yaw: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: string;
          target_scene_id?: string;
          label?: string | null;
          pitch?: number;
          yaw?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tour_hotspots_scene_id_fkey";
            columns: ["scene_id"];
            isOneToOne: false;
            referencedRelation: "tour_scenes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
