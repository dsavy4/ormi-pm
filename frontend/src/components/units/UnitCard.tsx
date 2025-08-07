import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  User, 
  Home, 
  Wrench, 
  Clock, 
  AlertCircle, 
  Eye 
} from 'lucide-react';

interface UnitCardProps {
  unit: any;
  onViewDetails: () => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, onViewDetails }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'occupied': return 'default';
      case 'vacant': return 'secondary';
      case 'maintenance': return 'destructive';
      case 'reserved': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'text-gray-600 dark:text-gray-400';
      case 'vacant': return 'text-gray-600 dark:text-gray-400';
      case 'maintenance': return 'text-gray-600 dark:text-gray-400';
      case 'reserved': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <User className="h-4 w-4" />;
      case 'vacant': return <Home className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
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
          <Badge 
            variant={getStatusVariant(unit.status)}
            className={`flex items-center gap-1 ${getStatusColor(unit.status)}`}
          >
            {getStatusIcon(unit.status)}
            <span className="hidden sm:inline">
              {unit.status === 'occupied' ? 'Occupied' : 
               unit.status === 'vacant' ? 'Available' : 
               unit.status === 'maintenance' ? 'Maintenance' : 
               unit.status === 'reserved' ? 'Reserved' : 'No Status'}
            </span>
          </Badge>
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