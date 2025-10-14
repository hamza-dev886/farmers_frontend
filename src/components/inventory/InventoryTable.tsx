import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash, Plus, Minus, AlertTriangle, Package } from "lucide-react";

interface InventoryItem {
  id: string;
  variant_id: string;
  farm_id: string;
  quantity_available: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  location: string;
  notes: string;
  last_updated_by: string;
  created_at: string;
  updated_at: string;
  product: {title: string}
  // Join fields from product if needed
  product_name?: string;
  sku?: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustStock: (itemId: string, adjustment: number, type: 'add' | 'remove') => void;
  loading?: boolean;
}

export function InventoryTable({ items, onEdit, onDelete, onAdjustStock, loading }: InventoryTableProps) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const filteredItems = items.filter(item => {
    const matchesSearch = !filter || 
      item.location?.toLowerCase().includes(filter.toLowerCase()) ||
      item.notes?.toLowerCase().includes(filter.toLowerCase()) ||
      item.product_name?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "low" && item.quantity_available <= item.low_stock_threshold) ||
      (statusFilter === "in-stock" && item.quantity_available > item.low_stock_threshold) ||
      (statusFilter === "out-of-stock" && item.quantity_available === 0);
    
    const matchesLocation = locationFilter === "all" || item.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const locations = [...new Set(items.map(item => item.location).filter(Boolean))];

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity_available === 0) return { status: "Out of Stock", variant: "destructive" as const };
    if (item.quantity_available <= item.low_stock_threshold) return { status: "Low Stock", variant: "destructive" as const };
    return { status: "In Stock", variant: "default" as const };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search inventory..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        {locations.length > 0 && (
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product/Location</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Low Stock Alert</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quick Adjust</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {item.product.title || `Variant ${item.variant_id.slice(0, 8)}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        📍 {item.location || 'Main Storage'}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-muted-foreground">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{item.quantity_available}</span>
                      {item.quantity_available <= item.low_stock_threshold && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity_reserved}</TableCell>
                  <TableCell>{item.low_stock_threshold}</TableCell>
                  <TableCell>
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAdjustStock(item.id, 1, 'remove')}
                        disabled={item.quantity_available <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAdjustStock(item.id, 1, 'add')}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter || statusFilter !== "all" || locationFilter !== "all" 
                ? "No inventory items match your filters." 
                : "No inventory items found."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}