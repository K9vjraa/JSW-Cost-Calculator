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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Alloy: {
        Row: {
          code: string
          createdAt: string
          createdById: string | null
          id: string
          name: string
          status: string
          type: string
          updatedAt: string
        }
        Insert: {
          code: string
          createdAt?: string
          createdById?: string | null
          id: string
          name: string
          status?: string
          type: string
          updatedAt: string
        }
        Update: {
          code?: string
          createdAt?: string
          createdById?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Alloy_createdById_fkey"
            columns: ["createdById"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      AlloyComponent: {
        Row: {
          alloyId: string
          compositionPercent: number
          createdAt: string
          gradeId: string | null
          id: string
          metalId: string | null
          quantity: number | null
          rawMaterialId: string | null
        }
        Insert: {
          alloyId: string
          compositionPercent: number
          createdAt?: string
          gradeId?: string | null
          id: string
          metalId?: string | null
          quantity?: number | null
          rawMaterialId?: string | null
        }
        Update: {
          alloyId?: string
          compositionPercent?: number
          createdAt?: string
          gradeId?: string | null
          id?: string
          metalId?: string | null
          quantity?: number | null
          rawMaterialId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AlloyComponent_alloyId_fkey"
            columns: ["alloyId"]
            isOneToOne: false
            referencedRelation: "Alloy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AlloyComponent_gradeId_fkey"
            columns: ["gradeId"]
            isOneToOne: false
            referencedRelation: "Grade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AlloyComponent_metalId_fkey"
            columns: ["metalId"]
            isOneToOne: false
            referencedRelation: "Metal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AlloyComponent_rawMaterialId_fkey"
            columns: ["rawMaterialId"]
            isOneToOne: false
            referencedRelation: "RawMaterial"
            referencedColumns: ["id"]
          },
        ]
      }
      AuditLog: {
        Row: {
          action: string
          createdAt: string
          details: Json
          entity: string
          entityId: string | null
          id: string
          ipAddress: string | null
          userId: string | null
        }
        Insert: {
          action: string
          createdAt?: string
          details: Json
          entity: string
          entityId?: string | null
          id: string
          ipAddress?: string | null
          userId?: string | null
        }
        Update: {
          action?: string
          createdAt?: string
          details?: Json
          entity?: string
          entityId?: string | null
          id?: string
          ipAddress?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AuditLog_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Calculation: {
        Row: {
          alloyId: string | null
          approvalReason: string | null
          approvedAt: string | null
          approvedById: string | null
          baseCost: number
          batchId: string
          completedAt: string | null
          createdAt: string
          finalCost: number
          gstAmount: number
          id: string
          mode: string
          name: string
          oldCost: number | null
          snapshot: Json
          status: Database["public"]["Enums"]["CalculationStatus"]
          totalQuantity: number
          updatedAt: string
          userId: string
        }
        Insert: {
          alloyId?: string | null
          approvalReason?: string | null
          approvedAt?: string | null
          approvedById?: string | null
          baseCost: number
          batchId: string
          completedAt?: string | null
          createdAt?: string
          finalCost: number
          gstAmount?: number
          id: string
          mode: string
          name: string
          oldCost?: number | null
          snapshot: Json
          status?: Database["public"]["Enums"]["CalculationStatus"]
          totalQuantity: number
          updatedAt: string
          userId: string
        }
        Update: {
          alloyId?: string | null
          approvalReason?: string | null
          approvedAt?: string | null
          approvedById?: string | null
          baseCost?: number
          batchId?: string
          completedAt?: string | null
          createdAt?: string
          finalCost?: number
          gstAmount?: number
          id?: string
          mode?: string
          name?: string
          oldCost?: number | null
          snapshot?: Json
          status?: Database["public"]["Enums"]["CalculationStatus"]
          totalQuantity?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Calculation_alloyId_fkey"
            columns: ["alloyId"]
            isOneToOne: false
            referencedRelation: "Alloy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Calculation_approvedById_fkey"
            columns: ["approvedById"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Calculation_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      CalculationItem: {
        Row: {
          baseCost: number
          calculationId: string
          compositionPct: number | null
          extraPrice: number
          gradeId: string | null
          gradeMultiplier: number
          id: string
          itemName: string
          metalId: string | null
          quantity: number
          rawMaterialId: string | null
          snapshot: Json
          unitPrice: number
        }
        Insert: {
          baseCost: number
          calculationId: string
          compositionPct?: number | null
          extraPrice: number
          gradeId?: string | null
          gradeMultiplier: number
          id: string
          itemName: string
          metalId?: string | null
          quantity: number
          rawMaterialId?: string | null
          snapshot: Json
          unitPrice: number
        }
        Update: {
          baseCost?: number
          calculationId?: string
          compositionPct?: number | null
          extraPrice?: number
          gradeId?: string | null
          gradeMultiplier?: number
          id?: string
          itemName?: string
          metalId?: string | null
          quantity?: number
          rawMaterialId?: string | null
          snapshot?: Json
          unitPrice?: number
        }
        Relationships: [
          {
            foreignKeyName: "CalculationItem_calculationId_fkey"
            columns: ["calculationId"]
            isOneToOne: false
            referencedRelation: "Calculation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CalculationItem_gradeId_fkey"
            columns: ["gradeId"]
            isOneToOne: false
            referencedRelation: "Grade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CalculationItem_metalId_fkey"
            columns: ["metalId"]
            isOneToOne: false
            referencedRelation: "Metal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CalculationItem_rawMaterialId_fkey"
            columns: ["rawMaterialId"]
            isOneToOne: false
            referencedRelation: "RawMaterial"
            referencedColumns: ["id"]
          },
        ]
      }
      ChemicalProperty: {
        Row: {
          aluminum: string | null
          carbon: string | null
          chromium: string | null
          copper: string | null
          createdAt: string
          gradeId: string
          id: string
          iron: string | null
          magnesium: string | null
          manganese: string | null
          molybdenum: string | null
          nickel: string | null
          phosphorus: string | null
          silicon: string | null
          sulfur: string | null
          updatedAt: string
          zinc: string | null
        }
        Insert: {
          aluminum?: string | null
          carbon?: string | null
          chromium?: string | null
          copper?: string | null
          createdAt?: string
          gradeId: string
          id: string
          iron?: string | null
          magnesium?: string | null
          manganese?: string | null
          molybdenum?: string | null
          nickel?: string | null
          phosphorus?: string | null
          silicon?: string | null
          sulfur?: string | null
          updatedAt: string
          zinc?: string | null
        }
        Update: {
          aluminum?: string | null
          carbon?: string | null
          chromium?: string | null
          copper?: string | null
          createdAt?: string
          gradeId?: string
          id?: string
          iron?: string | null
          magnesium?: string | null
          manganese?: string | null
          molybdenum?: string | null
          nickel?: string | null
          phosphorus?: string | null
          silicon?: string | null
          sulfur?: string | null
          updatedAt?: string
          zinc?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ChemicalProperty_gradeId_fkey"
            columns: ["gradeId"]
            isOneToOne: false
            referencedRelation: "Grade"
            referencedColumns: ["id"]
          },
        ]
      }
      ComparisonRecord: {
        Row: {
          createdAt: string
          gradeIds: Json
          id: string
          name: string
          updatedAt: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          gradeIds: Json
          id: string
          name: string
          updatedAt: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          gradeIds?: Json
          id?: string
          name?: string
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ComparisonRecord_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Grade: {
        Row: {
          bendProperties: Json
          chemicalComposition: Json
          createdAt: string
          extraPrice: number
          id: string
          mechanicalProperties: Json
          metalId: string
          multiplier: number
          name: string
          status: string
          subGrade: string | null
          toleranceProperties: Json
          updatedAt: string
        }
        Insert: {
          bendProperties: Json
          chemicalComposition: Json
          createdAt?: string
          extraPrice?: number
          id: string
          mechanicalProperties: Json
          metalId: string
          multiplier: number
          name: string
          status?: string
          subGrade?: string | null
          toleranceProperties: Json
          updatedAt: string
        }
        Update: {
          bendProperties?: Json
          chemicalComposition?: Json
          createdAt?: string
          extraPrice?: number
          id?: string
          mechanicalProperties?: Json
          metalId?: string
          multiplier?: number
          name?: string
          status?: string
          subGrade?: string | null
          toleranceProperties?: Json
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Grade_metalId_fkey"
            columns: ["metalId"]
            isOneToOne: false
            referencedRelation: "Metal"
            referencedColumns: ["id"]
          },
        ]
      }
      GstSlab: {
        Row: {
          active: boolean
          code: string
          createdAt: string
          description: string | null
          id: string
          name: string
          rate: number
          updatedAt: string
        }
        Insert: {
          active?: boolean
          code: string
          createdAt?: string
          description?: string | null
          id: string
          name: string
          rate: number
          updatedAt: string
        }
        Update: {
          active?: boolean
          code?: string
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          rate?: number
          updatedAt?: string
        }
        Relationships: []
      }
      JswProductCatalog: {
        Row: {
          basePrice: number
          category: string
          createdAt: string
          grade: string
          id: string
          image: string
          steelType: string
          subGrade: string
          updatedAt: string
        }
        Insert: {
          basePrice: number
          category: string
          createdAt?: string
          grade: string
          id: string
          image: string
          steelType: string
          subGrade: string
          updatedAt: string
        }
        Update: {
          basePrice?: number
          category?: string
          createdAt?: string
          grade?: string
          id?: string
          image?: string
          steelType?: string
          subGrade?: string
          updatedAt?: string
        }
        Relationships: []
      }
      MechanicalProperty: {
        Row: {
          bendRating: string
          createdAt: string
          elongation: string
          flatnessTolerance: string
          gradeId: string
          hardness: string
          id: string
          minBendRadius: string
          springback: string
          thicknessTolerance: string
          updatedAt: string
          uts: string
          widthTolerance: string
          yieldStrength: string
        }
        Insert: {
          bendRating: string
          createdAt?: string
          elongation: string
          flatnessTolerance: string
          gradeId: string
          hardness: string
          id: string
          minBendRadius: string
          springback: string
          thicknessTolerance: string
          updatedAt: string
          uts: string
          widthTolerance: string
          yieldStrength: string
        }
        Update: {
          bendRating?: string
          createdAt?: string
          elongation?: string
          flatnessTolerance?: string
          gradeId?: string
          hardness?: string
          id?: string
          minBendRadius?: string
          springback?: string
          thicknessTolerance?: string
          updatedAt?: string
          uts?: string
          widthTolerance?: string
          yieldStrength?: string
        }
        Relationships: [
          {
            foreignKeyName: "MechanicalProperty_gradeId_fkey"
            columns: ["gradeId"]
            isOneToOne: false
            referencedRelation: "Grade"
            referencedColumns: ["id"]
          },
        ]
      }
      Metal: {
        Row: {
          category: string
          code: string
          createdAt: string
          description: string | null
          id: string
          name: string
          status: string
          unit: string
          updatedAt: string
        }
        Insert: {
          category: string
          code: string
          createdAt?: string
          description?: string | null
          id: string
          name: string
          status?: string
          unit?: string
          updatedAt: string
        }
        Update: {
          category?: string
          code?: string
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          unit?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Notification: {
        Row: {
          category: string
          createdAt: string
          id: string
          message: string
          priority: Database["public"]["Enums"]["NotificationPriority"]
          readAt: string | null
          title: string
          userId: string | null
        }
        Insert: {
          category: string
          createdAt?: string
          id: string
          message: string
          priority?: Database["public"]["Enums"]["NotificationPriority"]
          readAt?: string | null
          title: string
          userId?: string | null
        }
        Update: {
          category?: string
          createdAt?: string
          id?: string
          message?: string
          priority?: Database["public"]["Enums"]["NotificationPriority"]
          readAt?: string | null
          title?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Notification_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      PriceHistory: {
        Row: {
          id: string
          metalId: string | null
          newPrice: number
          oldPrice: number | null
          rawMaterialId: string | null
          reason: string | null
          updatedAt: string
          updatedById: string
        }
        Insert: {
          id: string
          metalId?: string | null
          newPrice: number
          oldPrice?: number | null
          rawMaterialId?: string | null
          reason?: string | null
          updatedAt?: string
          updatedById: string
        }
        Update: {
          id?: string
          metalId?: string | null
          newPrice?: number
          oldPrice?: number | null
          rawMaterialId?: string | null
          reason?: string | null
          updatedAt?: string
          updatedById?: string
        }
        Relationships: [
          {
            foreignKeyName: "PriceHistory_metalId_fkey"
            columns: ["metalId"]
            isOneToOne: false
            referencedRelation: "Metal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PriceHistory_rawMaterialId_fkey"
            columns: ["rawMaterialId"]
            isOneToOne: false
            referencedRelation: "RawMaterial"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PriceHistory_updatedById_fkey"
            columns: ["updatedById"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      PriceList: {
        Row: {
          active: boolean
          createdAt: string
          currency: string
          effectiveFrom: string
          id: string
          location: string
          metalId: string | null
          pricePerUnit: number
          rawMaterialId: string | null
          source: string
          status: string
          supplierId: string | null
          unit: string
          updatedAt: string
        }
        Insert: {
          active?: boolean
          createdAt?: string
          currency?: string
          effectiveFrom: string
          id: string
          location?: string
          metalId?: string | null
          pricePerUnit: number
          rawMaterialId?: string | null
          source: string
          status?: string
          supplierId?: string | null
          unit?: string
          updatedAt: string
        }
        Update: {
          active?: boolean
          createdAt?: string
          currency?: string
          effectiveFrom?: string
          id?: string
          location?: string
          metalId?: string | null
          pricePerUnit?: number
          rawMaterialId?: string | null
          source?: string
          status?: string
          supplierId?: string | null
          unit?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "PriceList_metalId_fkey"
            columns: ["metalId"]
            isOneToOne: false
            referencedRelation: "Metal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PriceList_rawMaterialId_fkey"
            columns: ["rawMaterialId"]
            isOneToOne: false
            referencedRelation: "RawMaterial"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PriceList_supplierId_fkey"
            columns: ["supplierId"]
            isOneToOne: false
            referencedRelation: "Supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      RawMaterial: {
        Row: {
          code: string
          createdAt: string
          description: string | null
          id: string
          name: string
          status: string
          unit: string
          updatedAt: string
        }
        Insert: {
          code: string
          createdAt?: string
          description?: string | null
          id: string
          name: string
          status?: string
          unit?: string
          updatedAt: string
        }
        Update: {
          code?: string
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          unit?: string
          updatedAt?: string
        }
        Relationships: []
      }
      RefreshToken: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          replacedByHash: string | null
          revokedAt: string | null
          tokenHash: string
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          replacedByHash?: string | null
          revokedAt?: string | null
          tokenHash: string
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          replacedByHash?: string | null
          revokedAt?: string | null
          tokenHash?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "RefreshToken_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Report: {
        Row: {
          calculationId: string | null
          createdAt: string
          filters: Json
          generatedById: string
          id: string
          name: string
          type: string
        }
        Insert: {
          calculationId?: string | null
          createdAt?: string
          filters: Json
          generatedById: string
          id: string
          name: string
          type: string
        }
        Update: {
          calculationId?: string | null
          createdAt?: string
          filters?: Json
          generatedById?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "Report_generatedById_fkey"
            columns: ["generatedById"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Role: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          name: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      Supplier: {
        Row: {
          code: string
          contactName: string | null
          createdAt: string
          email: string
          id: string
          name: string
          phone: string | null
          status: string
          updatedAt: string
        }
        Insert: {
          code: string
          contactName?: string | null
          createdAt?: string
          email: string
          id: string
          name: string
          phone?: string | null
          status?: string
          updatedAt: string
        }
        Update: {
          code?: string
          contactName?: string | null
          createdAt?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updatedAt?: string
        }
        Relationships: []
      }
      SystemSetting: {
        Row: {
          category: string
          createdAt: string
          description: string | null
          id: string
          key: string
          label: string
          updatedAt: string
          updatedById: string | null
          value: string
        }
        Insert: {
          category?: string
          createdAt?: string
          description?: string | null
          id: string
          key: string
          label: string
          updatedAt: string
          updatedById?: string | null
          value: string
        }
        Update: {
          category?: string
          createdAt?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
          updatedAt?: string
          updatedById?: string | null
          value?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          createdAt: string
          department: string | null
          email: string
          failedLoginCount: number
          id: string
          lastLoginAt: string | null
          lockedUntil: string | null
          name: string
          passwordHash: string
          roleId: string
          status: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          department?: string | null
          email: string
          failedLoginCount?: number
          id: string
          lastLoginAt?: string | null
          lockedUntil?: string | null
          name: string
          passwordHash: string
          roleId: string
          status?: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          department?: string | null
          email?: string
          failedLoginCount?: number
          id?: string
          lastLoginAt?: string | null
          lockedUntil?: string | null
          name?: string
          passwordHash?: string
          roleId?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "User_roleId_fkey"
            columns: ["roleId"]
            isOneToOne: false
            referencedRelation: "Role"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      CalculationStatus:
        | "DRAFT"
        | "SUBMITTED"
        | "APPROVED"
        | "COMPLETED"
        | "CANCELLED"
      NotificationPriority: "LOW" | "MEDIUM" | "HIGH"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      CalculationStatus: [
        "DRAFT",
        "SUBMITTED",
        "APPROVED",
        "COMPLETED",
        "CANCELLED",
      ],
      NotificationPriority: ["LOW", "MEDIUM", "HIGH"],
    },
  },
} as const
