import { createClient } from '@supabase/supabase-js';

export interface PropertyHealthFactors {
  occupancyRate: number;
  maintenanceRequests: number;
  urgentMaintenanceRequests: number;
  propertyAge: number;
  amenitiesCount: number;
  financialPerformance: number;
  inspectionStatus: number;
  marketPosition: number;
}

export interface PropertyHealthScore {
  score: number;
  factors: PropertyHealthFactors;
  breakdown: {
    occupancy: number;
    maintenance: number;
    age: number;
    amenities: number;
    financial: number;
    inspection: number;
    market: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
}

export class PropertyHealthTriggerService {
  /**
   * Calculate comprehensive property health score based on industry standards
   */
  private static async calculatePropertyHealth(propertyId: string, env: any): Promise<PropertyHealthScore> {
    try {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      // Get property with all related data
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          units (
            *,
            payments (*),
            maintenance_requests (*)
          ),
          maintenance_requests (*)
        `)
        .eq('id', propertyId)
        .single();

      if (propertyError || !property) {
        throw new Error('Property not found');
      }

      // Calculate individual factors
      const factors = await this.calculateHealthFactors(property);
      
      // Calculate weighted score
      const score = this.calculateWeightedScore(factors);
      
      // Determine grade and status
      const grade = this.getGrade(score);
      const status = this.getStatus(score);
      
      // Calculate breakdown for transparency
      const breakdown = this.calculateBreakdown(factors);

      return {
        score: Math.round(score),
        factors,
        breakdown,
        grade,
        status,
      };
    } catch (error) {
      console.error('Error calculating property health:', error);
      throw error;
    }
  }

  /**
   * Calculate individual health factors based on industry benchmarks
   */
  private static async calculateHealthFactors(property: any): Promise<PropertyHealthFactors> {
    const totalUnits = property.units?.length || 0;
    const occupiedUnits = property.units?.filter((unit: any) => unit.status === 'OCCUPIED').length || 0;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // Maintenance metrics
    const maintenanceRequests = property.maintenance_requests?.length || 0;
    const urgentMaintenanceRequests = property.maintenance_requests?.filter(
      (req: any) => req.priority === 'URGENT'
    ).length || 0;

    // Property age factor
    const currentYear = new Date().getFullYear();
    const propertyAge = property.yearBuilt ? currentYear - property.yearBuilt : 0;

    // Amenities count
    const amenitiesCount = property.amenities?.length || 0;

    // Financial performance (simplified)
    const financialPerformance = 75; // Default value, can be enhanced later

    // Inspection status (simplified)
    const inspectionStatus = 80; // Default value, can be enhanced later

    // Market position (simplified)
    const marketPosition = 70; // Default value, can be enhanced later

    return {
      occupancyRate,
      maintenanceRequests,
      urgentMaintenanceRequests,
      propertyAge,
      amenitiesCount,
      financialPerformance,
      inspectionStatus,
      marketPosition,
    };
  }

  /**
   * Calculate weighted health score based on industry standards
   */
  private static calculateWeightedScore(factors: PropertyHealthFactors): number {
    const weights = {
      occupancy: 0.25,      // 25% - Most important for property health
      maintenance: 0.20,     // 20% - Critical for tenant satisfaction
      age: 0.15,            // 15% - Affects maintenance needs
      amenities: 0.10,      // 10% - Attracts and retains tenants
      financial: 0.15,      // 15% - Revenue and profitability
      inspection: 0.10,     // 10% - Compliance and safety
      market: 0.05,         // 5% - Market positioning
    };

    const scores = {
      occupancy: this.calculateOccupancyScore(factors.occupancyRate),
      maintenance: this.calculateMaintenanceScore(factors.maintenanceRequests, factors.urgentMaintenanceRequests),
      age: this.calculateAgeScore(factors.propertyAge),
      amenities: this.calculateAmenitiesScore(factors.amenitiesCount),
      financial: this.calculateFinancialScore(factors.financialPerformance),
      inspection: this.calculateInspectionScore(factors.inspectionStatus),
      market: this.calculateMarketScore(factors.marketPosition),
    };

    let totalScore = 100; // Start with perfect score

    // Apply weighted adjustments
    totalScore += (scores.occupancy * weights.occupancy);
    totalScore += (scores.maintenance * weights.maintenance);
    totalScore += (scores.age * weights.age);
    totalScore += (scores.amenities * weights.amenities);
    totalScore += (scores.financial * weights.financial);
    totalScore += (scores.inspection * weights.inspection);
    totalScore += (scores.market * weights.market);

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, totalScore));
  }

  /**
   * Calculate occupancy score component
   */
  private static calculateOccupancyScore(occupancyRate: number): number {
    if (occupancyRate >= 95) return 20;     // Excellent
    if (occupancyRate >= 90) return 15;     // Very Good
    if (occupancyRate >= 85) return 10;     // Good
    if (occupancyRate >= 80) return 5;      // Fair
    if (occupancyRate >= 70) return 0;      // Acceptable
    if (occupancyRate >= 60) return -5;     // Below Average
    if (occupancyRate >= 50) return -10;    // Poor
    return -20;                             // Critical
  }

  /**
   * Calculate maintenance score component
   */
  private static calculateMaintenanceScore(totalRequests: number, urgentRequests: number): number {
    let score = 0;
    
    // Base score on total requests
    if (totalRequests === 0) return 20;     // Perfect
    if (totalRequests <= 2) return 15;      // Excellent
    if (totalRequests <= 5) return 10;      // Good
    if (totalRequests <= 10) return 5;      // Fair
    if (totalRequests <= 20) return 0;      // Acceptable
    if (totalRequests <= 30) return -5;     // Below Average
    if (totalRequests <= 50) return -10;    // Poor
    score -= 20;                            // Critical

    // Penalty for urgent requests
    score -= (urgentRequests * 2);

    return Math.max(-20, score);
  }

  /**
   * Calculate age score component
   */
  private static calculateAgeScore(propertyAge: number): number {
    if (propertyAge <= 5) return 20;        // New
    if (propertyAge <= 10) return 15;       // Very Good
    if (propertyAge <= 20) return 10;       // Good
    if (propertyAge <= 30) return 5;        // Fair
    if (propertyAge <= 40) return 0;        // Acceptable
    if (propertyAge <= 50) return -5;       // Below Average
    if (propertyAge <= 60) return -10;      // Poor
    return -20;                             // Critical
  }

  /**
   * Calculate amenities score component
   */
  private static calculateAmenitiesScore(amenitiesCount: number): number {
    if (amenitiesCount >= 10) return 20;    // Excellent
    if (amenitiesCount >= 8) return 15;     // Very Good
    if (amenitiesCount >= 6) return 10;     // Good
    if (amenitiesCount >= 4) return 5;      // Fair
    if (amenitiesCount >= 2) return 0;      // Acceptable
    if (amenitiesCount >= 1) return -5;     // Below Average
    return -10;                             // Poor
  }

  /**
   * Calculate financial score component
   */
  private static calculateFinancialScore(collectionRate: number): number {
    if (collectionRate >= 95) return 20;    // Excellent
    if (collectionRate >= 90) return 15;    // Very Good
    if (collectionRate >= 85) return 10;    // Good
    if (collectionRate >= 80) return 5;     // Fair
    if (collectionRate >= 70) return 0;     // Acceptable
    if (collectionRate >= 60) return -5;    // Below Average
    if (collectionRate >= 50) return -10;   // Poor
    return -20;                             // Critical
  }

  /**
   * Calculate inspection score component
   */
  private static calculateInspectionScore(inspectionStatus: number): number {
    if (inspectionStatus >= 90) return 20;  // Excellent
    if (inspectionStatus >= 80) return 15;  // Very Good
    if (inspectionStatus >= 70) return 10;  // Good
    if (inspectionStatus >= 60) return 5;   // Fair
    if (inspectionStatus >= 50) return 0;   // Acceptable
    if (inspectionStatus < 50) return -5;   // Below Average
    if (inspectionStatus < 40) return -10;  // Poor
    return -20;                             // Critical
  }

  /**
   * Calculate market position score component
   */
  private static calculateMarketScore(marketPosition: number): number {
    if (marketPosition >= 90) return 20;     // Excellent
    if (marketPosition >= 80) return 15;     // Very Good
    if (marketPosition >= 70) return 10;     // Good
    if (marketPosition >= 60) return 5;      // Fair
    if (marketPosition >= 50) return 0;      // Acceptable
    if (marketPosition >= 40) return -5;     // Below Average
    if (marketPosition >= 30) return -10;    // Poor
    return -20;                              // Critical
  }

  /**
   * Get letter grade based on score
   */
  private static getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get status description based on score
   */
  private static getStatus(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical' {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  }

  /**
   * Calculate breakdown for transparency
   */
  private static calculateBreakdown(factors: PropertyHealthFactors) {
    return {
      occupancy: this.calculateOccupancyScore(factors.occupancyRate),
      maintenance: this.calculateMaintenanceScore(factors.maintenanceRequests, factors.urgentMaintenanceRequests),
      age: this.calculateAgeScore(factors.propertyAge),
      amenities: this.calculateAmenitiesScore(factors.amenitiesCount),
      financial: this.calculateFinancialScore(factors.financialPerformance),
      inspection: this.calculateInspectionScore(factors.inspectionStatus),
      market: this.calculateMarketScore(factors.marketPosition),
    };
  }

  /**
   * Update property health score in database
   */
  private static async updatePropertyHealth(propertyId: string, env: any): Promise<void> {
    try {
      const healthScore = await this.calculatePropertyHealth(propertyId, env);
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { error } = await supabase
        .from('properties')
        .update({
          property_health: healthScore.score,
          last_health_calculation: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating property health:', error);
      throw error;
    }
  }

  /**
   * Trigger health recalculation when unit status changes
   * This should be called whenever a unit is created, updated, or deleted
   */
  static async onUnitStatusChange(propertyId: string, env: any): Promise<void> {
    try {
      console.log(`🔄 Unit status changed for property ${propertyId}, recalculating health...`);
      await this.updatePropertyHealth(propertyId, env);
      console.log(`✅ Health recalculated for property ${propertyId}`);
    } catch (error) {
      console.error(`❌ Failed to recalculate health for property ${propertyId}:`, error);
    }
  }

  /**
   * Trigger health recalculation when maintenance request changes
   * This should be called whenever a maintenance request is created, updated, or completed
   */
  static async onMaintenanceRequestChange(propertyId: string, env: any): Promise<void> {
    try {
      console.log(`🔧 Maintenance request changed for property ${propertyId}, recalculating health...`);
      await this.updatePropertyHealth(propertyId, env);
      console.log(`✅ Health recalculated for property ${propertyId}`);
    } catch (error) {
      console.error(`❌ Failed to recalculate health for property ${propertyId}:`, error);
    }
  }

  /**
   * Trigger health recalculation when property details change
   * This should be called whenever property amenities, year built, or other relevant fields change
   */
  static async onPropertyDetailsChange(propertyId: string, env: any): Promise<void> {
    try {
      console.log(`🏠 Property details changed for property ${propertyId}, recalculating health...`);
      await this.updatePropertyHealth(propertyId, env);
      console.log(`✅ Health recalculated for property ${propertyId}`);
    } catch (error) {
      console.error(`❌ Failed to recalculate health for property ${propertyId}:`, error);
    }
  }

  /**
   * Trigger health recalculation when financial data changes
   * This should be called whenever payments, rent amounts, or collection rates change
   */
  static async onFinancialDataChange(propertyId: string, env: any): Promise<void> {
    try {
      console.log(`💰 Financial data changed for property ${propertyId}, recalculating health...`);
      await this.updatePropertyHealth(propertyId, env);
      console.log(`✅ Health recalculated for property ${propertyId}`);
    } catch (error) {
      console.error(`❌ Failed to recalculate health for property ${propertyId}:`, error);
    }
  }

  /**
   * Batch recalculate health for all properties (for initial setup or data migration)
   */
  static async recalculateAllProperties(env: any): Promise<void> {
    try {
      console.log('🔄 Recalculating health for all properties...');
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id');

      if (error) {
        throw error;
      }

      for (const property of properties) {
        try {
          await this.updatePropertyHealth(property.id, env);
        } catch (error) {
          console.warn(`Failed to update health for property ${property.id}:`, error);
        }
      }
      console.log('✅ All property health scores recalculated');
    } catch (error) {
      console.error('❌ Failed to recalculate all property health:', error);
      throw error;
    }
  }
}
