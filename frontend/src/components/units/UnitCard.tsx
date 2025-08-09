import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Building, 
  Eye 
} from 'lucide-react';

interface UnitCardProps {
  unit: any;
  onViewDetails: () => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, onViewDetails }) => {
  const getStatusType = (unit: any) => {
    if (unit.status === 'occupied') return 'occupied';
    if (unit.status === 'vacant') return 'vacant';
    if (unit.status === 'maintenance') return 'maintenance';
    if (unit.status === 'reserved') return 'reserved';
    return 'default';
  };

  return (
    <Card className="group hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-300 border-border/50 hover:border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
              <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-foreground">Unit {unit.number}</h3>
          </div>
          <StatusBadge 
            status={getStatusType(unit)}
            size="sm"
            className="flex-shrink-0"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monthly Rent</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              ${unit.monthlyRent?.toLocaleString()}
            </span>
          </div>
          
          {unit.tenant && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Tenant</span>
              <span className="font-medium text-foreground truncate max-w-[120px]">
                {unit.tenant.name}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Size</span>
            <span className="font-medium text-foreground">
              {unit.bedrooms}BR/{unit.bathrooms}BA
            </span>
          </div>

          {unit.squareFootage && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Square Feet</span>
              <span className="font-medium text-foreground">
                {unit.squareFootage} sqft
              </span>
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={onViewDetails}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}; 