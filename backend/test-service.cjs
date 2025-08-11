const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock the PropertyHealthService logic
class MockPropertyHealthService {
  static async calculatePropertyHealth(propertyId) {
    try {
      // Get property with all related data
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          units: {
            include: {
              payments: true,
              maintenanceRequests: true,
            },
          },
          maintenanceRequests: true,
        },
      });

      if (!property) {
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

  static async calculateHealthFactors(property) {
    const totalUnits = property.units.length;
    const occupiedUnits = property.units.filter((unit) => unit.status === 'OCCUPIED').length;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // Maintenance metrics
    const maintenanceRequests = property.maintenanceRequests.length;
    const urgentMaintenanceRequests = property.maintenanceRequests.filter(
      (req) => req.priority === 'URGENT'
    ).length;

    // Property age factor
    const currentYear = new Date().getFullYear();
    const propertyAge = property.yearBuilt ? currentYear - property.yearBuilt : 0;

    // Amenities factor
    const amenitiesCount = property.amenities ? property.amenities.length : 0;

    // Financial performance (simplified)
    const collectionRate = 85; // Default value for now

    // Inspection status (simplified)
    const inspectionStatus = 80; // Default value for now

    // Market position (simplified)
    const marketPosition = 75; // Default value for now

    return {
      occupancyRate,
      maintenanceRequests,
      urgentMaintenanceRequests,
      propertyAge,
      amenitiesCount,
      financialPerformance: collectionRate,
      inspectionStatus,
      marketPosition,
    };
  }

  static calculateWeightedScore(factors) {
    const occupancyScore = this.calculateOccupancyScore(factors.occupancyRate);
    const maintenanceScore = this.calculateMaintenanceScore(factors.maintenanceRequests, factors.urgentMaintenanceRequests);
    const ageScore = this.calculateAgeScore(factors.propertyAge);
    const amenitiesScore = this.calculateAmenitiesScore(factors.amenitiesCount);
    const financialScore = this.calculateFinancialScore(factors.financialPerformance);
    const inspectionScore = this.calculateInspectionScore(factors.inspectionStatus);
    const marketScore = this.calculateMarketScore(factors.marketPosition);

    // Weighted calculation based on industry standards
    return (
      occupancyScore * 0.25 +      // 25% - Occupancy is critical
      maintenanceScore * 0.20 +    // 20% - Maintenance affects tenant satisfaction
      ageScore * 0.15 +            // 15% - Age affects maintenance needs
      amenitiesScore * 0.15 +      // 15% - Amenities affect desirability
      financialScore * 0.10 +      // 10% - Financial health
      inspectionScore * 0.10 +     // 10% - Compliance and safety
      marketScore * 0.05           // 5% - Market positioning
    );
  }

  static calculateOccupancyScore(occupancyRate) {
    if (occupancyRate >= 95) return 100;
    if (occupancyRate >= 90) return 95;
    if (occupancyRate >= 85) return 90;
    if (occupancyRate >= 80) return 85;
    if (occupancyRate >= 75) return 80;
    if (occupancyRate >= 70) return 75;
    if (occupancyRate >= 65) return 70;
    if (occupancyRate >= 60) return 65;
    if (occupancyRate >= 50) return 60;
    return Math.max(30, occupancyRate);
  }

  static calculateMaintenanceScore(totalRequests, urgentRequests) {
    if (totalRequests === 0) return 100;
    if (urgentRequests === 0 && totalRequests <= 2) return 95;
    if (urgentRequests === 0 && totalRequests <= 5) return 90;
    if (urgentRequests === 0 && totalRequests <= 10) return 85;
    if (urgentRequests <= 1 && totalRequests <= 15) return 80;
    if (urgentRequests <= 2 && totalRequests <= 20) return 75;
    if (urgentRequests <= 3 && totalRequests <= 25) return 70;
    if (urgentRequests <= 5 && totalRequests <= 30) return 65;
    return Math.max(30, 100 - (urgentRequests * 10) - (totalRequests * 2));
  }

  static calculateAgeScore(propertyAge) {
    if (propertyAge === 0) return 80; // Unknown age gets middle score
    if (propertyAge <= 5) return 100;
    if (propertyAge <= 10) return 95;
    if (propertyAge <= 15) return 90;
    if (propertyAge <= 20) return 85;
    if (propertyAge <= 25) return 80;
    if (propertyAge <= 30) return 75;
    if (propertyAge <= 40) return 70;
    if (propertyAge <= 50) return 65;
    return Math.max(30, 100 - (propertyAge * 1.5));
  }

  static calculateAmenitiesScore(amenitiesCount) {
    if (amenitiesCount === 0) return 50;
    if (amenitiesCount === 1) return 60;
    if (amenitiesCount === 2) return 70;
    if (amenitiesCount === 3) return 80;
    if (amenitiesCount === 4) return 90;
    return Math.min(100, 90 + (amenitiesCount - 4) * 2);
  }

  static calculateFinancialScore(collectionRate) {
    return Math.max(30, Math.min(100, collectionRate));
  }

  static calculateInspectionScore(inspectionStatus) {
    return Math.max(30, Math.min(100, inspectionStatus));
  }

  static calculateMarketScore(marketPosition) {
    return Math.max(30, Math.min(100, marketPosition));
  }

  static getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  static getStatus(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  }

  static calculateBreakdown(factors) {
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

  static async updatePropertyHealth(propertyId) {
    try {
      const healthScore = await this.calculatePropertyHealth(propertyId);
      
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          propertyHealth: healthScore.score,
          lastHealthCalculation: new Date(),
        },
      });

      console.log(`Updated property ${propertyId} health to ${healthScore.score}`);
      return healthScore;
    } catch (error) {
      console.error(`Failed to update property health for ${propertyId}:`, error);
      throw error;
    }
  }
}

async function testService() {
  try {
    console.log('Testing MockPropertyHealthService...');
    
    const propertyId = 'test123';
    
    // Test health calculation
    const healthResult = await MockPropertyHealthService.calculatePropertyHealth(propertyId);
    console.log('Health calculation result:', JSON.stringify(healthResult, null, 2));
    
    // Test health update
    await MockPropertyHealthService.updatePropertyHealth(propertyId);
    
    // Verify the update
    const updatedProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { propertyHealth: true, lastHealthCalculation: true }
    });
    
    console.log('Updated property health:', updatedProperty);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testService();
