import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: 'increase' | 'decrease' | 'set' | 'transfer';
  quantity_before: number;
  quantity_after: number;
  quantity_changed: number;
  reason: string;
  reference_id?: string;
  performed_by: string;
  created_at: string;
  // Join fields
  item_name?: string;
  location?: string;
  user_name?: string;
}

interface InventoryMovementsProps {
  farmId: string;
}

export function InventoryMovements({ farmId }: InventoryMovementsProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Mock data for now - in real app this would fetch from a movements table
  useEffect(() => {
    const mockMovements: InventoryMovement[] = [
      {
        id: "1",
        item_id: "item-1",
        movement_type: "increase",
        quantity_before: 50,
        quantity_after: 100,
        quantity_changed: 50,
        reason: "Received shipment",
        performed_by: "user-1",
        created_at: new Date().toISOString(),
        item_name: "Organic Tomatoes",
        location: "Greenhouse 1",
        user_name: "John Farmer"
      },
      {
        id: "2", 
        item_id: "item-2",
        movement_type: "decrease",
        quantity_before: 25,
        quantity_after: 20,
        quantity_changed: -5,
        reason: "Sale/Customer order",
        performed_by: "user-1",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        item_name: "Fresh Lettuce",
        location: "Cold Storage",
        user_name: "John Farmer"
      },
      {
        id: "3",
        item_id: "item-1", 
        movement_type: "decrease",
        quantity_before: 100,
        quantity_after: 95,
        quantity_changed: -5,
        reason: "Damaged/spoiled",
        performed_by: "user-1",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        item_name: "Organic Tomatoes",
        location: "Greenhouse 1",
        user_name: "John Farmer"
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setMovements(mockMovements);
      setLoading(false);
    }, 1000);
  }, [farmId]);

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = !filter || 
      movement.item_name?.toLowerCase().includes(filter.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(filter.toLowerCase()) ||
      movement.location?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesType = typeFilter === "all" || movement.movement_type === typeFilter;
    
    const movementDate = new Date(movement.created_at);
    const matchesDateRange = (!dateFrom || movementDate >= dateFrom) && 
                            (!dateTo || movementDate <= dateTo);
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'increase': return 'Stock In';
      case 'decrease': return 'Stock Out';
      case 'set': return 'Adjustment';
      case 'transfer': return 'Transfer';
      default: return type;
    }
  };

  const getMovementVariant = (type: string) => {
    switch (type) {
      case 'increase': return 'default';
      case 'decrease': return 'secondary';
      case 'set': return 'outline';
      case 'transfer': return 'outline';
      default: return 'outline';
    }
  };

  const exportMovements = () => {
    // In a real app, this would generate and download a CSV/Excel file
    const csvContent = [
      ['Date', 'Item', 'Location', 'Type', 'Before', 'After', 'Change', 'Reason', 'User'].join(','),
      ...filteredMovements.map(movement => [
        new Date(movement.created_at).toLocaleDateString(),
        movement.item_name || '',
        movement.location || '',
        getMovementTypeLabel(movement.movement_type),
        movement.quantity_before,
        movement.quantity_after,
        movement.quantity_changed,
        movement.reason,
        movement.user_name || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-movements-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Movements</CardTitle>
            <CardDescription>Track all inventory changes and adjustments</CardDescription>
          </div>
          <Button onClick={exportMovements} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search movements..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Movement Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="increase">Stock In</SelectItem>
              <SelectItem value="decrease">Stock Out</SelectItem>
              <SelectItem value="set">Adjustments</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, "MMM dd") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {(dateFrom || dateTo) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Movements Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Item & Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {format(new Date(movement.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(movement.created_at), 'HH:mm:ss')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{movement.item_name}</div>
                        <div className="text-sm text-muted-foreground">
                          📍 {movement.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getMovementVariant(movement.movement_type) as any}>
                        {getMovementTypeLabel(movement.movement_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.quantity_before}</TableCell>
                    <TableCell>{movement.quantity_after}</TableCell>
                    <TableCell>
                      <span className={movement.quantity_changed > 0 ? 'text-green-600' : 'text-red-600'}>
                        {movement.quantity_changed > 0 ? '+' : ''}{movement.quantity_changed}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {movement.reason}
                    </TableCell>
                    <TableCell>{movement.user_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter || typeFilter !== "all" || dateFrom || dateTo
                  ? "No movements match your filters."
                  : "No inventory movements found."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}