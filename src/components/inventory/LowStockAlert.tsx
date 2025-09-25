import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, Plus } from "lucide-react";

interface LowStockItem {
  id: string;
  product_name: string;
  location: string;
  quantity_available: number;
  low_stock_threshold: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
  onRestock: (itemId: string) => void;
}

export function LowStockAlert({ items, onRestock }: LowStockAlertProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Stock Status
          </CardTitle>
          <CardDescription>All items are well stocked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">✓</div>
            <p className="text-sm text-muted-foreground">
              No items require immediate attention
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Low Stock Alert
        </CardTitle>
        <CardDescription>
          {items.length} item{items.length !== 1 ? 's' : ''} running low
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.product_name}</div>
                <div className="text-sm text-muted-foreground">
                  📍 {item.location}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="destructive" className="text-xs">
                    {item.quantity_available} left
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Alert at {item.low_stock_threshold}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onRestock(item.id)}
                className="ml-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                Restock
              </Button>
            </div>
          ))}
          
          {items.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                + {items.length - 5} more items need attention
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}