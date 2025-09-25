import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Clock, Info } from "lucide-react";

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'overstock';
  message: string;
  severity: 'high' | 'medium' | 'low';
  item_name: string;
  location: string;
  created_at: string;
}

interface InventoryAlertsProps {
  alerts: InventoryAlert[];
}

export function InventoryAlerts({ alerts }: InventoryAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'expiring_soon':
        return <Clock className="h-4 w-4" />;
      case 'overstock':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      case 'low':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>No active inventory alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-green-600 mb-2">✓</div>
            <p className="text-sm text-muted-foreground">
              All inventory levels are within normal ranges
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group alerts by severity
  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.severity]) acc[alert.severity] = [];
    acc[alert.severity].push(alert);
    return acc;
  }, {} as Record<string, InventoryAlert[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Alerts</CardTitle>
        <CardDescription>
          {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* High priority alerts first */}
          {['high', 'medium', 'low'].map(severity => 
            groupedAlerts[severity]?.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={getSeverityColor(alert.severity)}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{alert.item_name}</span>
                    <Badge variant={getAlertVariant(alert.severity)} className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {alert.message}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    📍 {alert.location} • {new Date(alert.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}