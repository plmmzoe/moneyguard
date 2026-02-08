export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          active_saving: number | null
          created_at: string | null
          currency: string | null
          monthly_budget: number | null
          setup_complete: boolean
          spending_mindset: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          savings_goal_reward: string | null
          savings_goal_amount: number | null
          monthly_irregular_spending: number | null
          savings_goal_target_date: string | null
          total_saved: number | null
        }
        Insert: {
          active_saving?: number | null
          created_at?: string | null
          currency?: string | null
          monthly_budget?: number | null
          setup_complete?: boolean
          spending_mindset?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          savings_goal_reward?: string | null
          savings_goal_amount?: number | null
          monthly_irregular_spending?: number | null
          savings_goal_target_date?: string | null
          total_saved?: number | null
        }
        Update: {
          active_saving?: number | null
          created_at?: string | null
          currency?: string | null
          monthly_budget?: number | null
          setup_complete?: boolean
          spending_mindset?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          savings_goal_reward?: string | null
          savings_goal_amount?: number | null
          monthly_irregular_spending?: number | null
          savings_goal_target_date?: string | null
          total_saved?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_active_saving_fkey'
            columns: ['active_saving']
            isOneToOne: false
            referencedRelation: 'savings'
            referencedColumns: ['id']
          },
        ]
      }
      savings: {
        Row: {
          created_at: string
          description: string | null
          expire_at: string
          goal: number
          id: number
          is_active: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expire_at: string
          goal: number
          id?: number
          is_active?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expire_at?: string
          goal?: number
          id?: number
          is_active?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          analysis: string | null
          associated_savings: number | null
          cooloff_expiry: string | null
          created_at: string
          transaction_description: string
          transaction_id: string
          transaction_state: Database['public']['Enums']['status'] | null
          user_id: string
          verdict: Database['public']['Enums']['impulse'] | null
        }
        Insert: {
          amount: number
          analysis?: string | null
          associated_savings?: number | null
          cooloff_expiry?: string | null
          created_at?: string
          transaction_description: string
          transaction_id?: string
          transaction_state?: Database['public']['Enums']['status'] | null
          user_id: string
          verdict?: Database['public']['Enums']['impulse'] | null
        }
        Update: {
          amount?: number
          analysis?: string | null
          associated_savings?: number | null
          cooloff_expiry?: string | null
          created_at?: string
          transaction_description?: string
          transaction_id?: string
          transaction_state?: Database['public']['Enums']['status'] | null
          user_id?: string
          verdict?: Database['public']['Enums']['impulse'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_associated_savings_fkey'
            columns: ['associated_savings']
            isOneToOne: false
            referencedRelation: 'savings'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment: { Args: { row_id: string; x: number }; Returns: undefined }
      incrementsavings: {
        Args: { price: number; target_user_id: string }
        Returns: undefined
      }
      total_amount: {
        Args: { savings_row: Database['public']['Tables']['savings']['Row'] }
        Returns: number
      }
    }
    Enums: {
      impulse: 'high' | 'medium' | 'low'
      status: 'bought' | 'waiting' | 'discarded' | 'draft'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      impulse: ['high', 'medium', 'low'],
      status: ['bought', 'waiting', 'discarded', 'draft'],
    },
  },
} as const;
