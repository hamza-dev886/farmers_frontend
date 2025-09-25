import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Minus } from "lucide-react";

interface InventoryItem {
  id: string;
  title: string;
  sku?: string;
  product_id: string;
  manage_inventory: boolean;
  allow_backorder: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    title: string;
    handle: string;
  };
  inventory_levels?: {
    stocked_quantity: number;
    reserved_quantity: number;
    location_id: string;
  }[];
  price_set?: {
    amount: number;
    currency_code: string;
  };
}

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustStock: (itemId: string, adjustment: number, type: 'add' | 'remove') => void;
  loading: boolean;
}

export const InventoryTable = ({ items, onEdit, onDelete, onAdjustStock, loading }: InventoryTableProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Reserved</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No inventory items found. Start by adding your first product variant.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.product?.title}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.sku || 'N/A'}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {item.inventory_levels?.[0]?.stocked_quantity || 0}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAdjustStock(item.id, 1, 'remove')}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAdjustStock(item.id, 1, 'add')}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {item.inventory_levels?.[0]?.reserved_quantity || 0}
                </TableCell>
                <TableCell>
                  ${item.price_set?.amount || 0} {item.price_set?.currency_code || 'USD'}
                </TableCell>
                <TableCell>
                  <Badge variant={item.manage_inventory ? "default" : "secondary"}>
                    {item.manage_inventory ? "Managed" : "Unmanaged"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};