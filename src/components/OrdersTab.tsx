import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Order {
  id: string;
  customer_id: string;
  email: string;
  status: string;
  delivery_notes: string | null;
  pickup_time: string | null;
  created_at: string;
  metadata: any;
}

const statusColors = {
  pending: 'bg-yellow-500',
  new: 'bg-blue-500',
  in_progress: 'bg-orange-500',
  ready_for_pickup: 'bg-green-500',
  delivered: 'bg-gray-500',
};

const statusLabels = {
  pending: 'Pending',
  new: 'New',
  in_progress: 'In Progress',
  ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
};

interface OrdersTabProps {
  farmId?: string;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ farmId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [farmId]);

  const fetchOrders = async () => {
    if (!farmId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('order')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter orders that contain products from this farm
      const farmOrders = (data || []).filter((order: Order) => {
        const cartItems = order.metadata?.cart_items || [];
        return cartItems.some((item: any) => item.farmId === farmId);
      });
      
      setOrders(farmOrders as Order[]);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('order')
        .update({ status: newStatus as any })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));

      toast({
        title: "Order status updated",
        description: `Order status changed to ${statusLabels[newStatus as keyof typeof statusLabels]}`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Orders</h2>
        <p className="text-muted-foreground">Manage your farm orders</p>
      </div>

      {!farmId ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please select a farm to view orders.</p>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No orders for this farm yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), 'PPp')}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${statusColors[order.status as keyof typeof statusColors]} text-white`}
                  >
                    {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <p className="text-sm">
                      <strong>Name:</strong> {order.metadata?.customer_name || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {order.email}
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> {order.metadata?.phone || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <strong>Address:</strong> {order.metadata?.delivery_address || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Order Details</h4>
                    <p className="text-sm">
                      <strong>Total Items:</strong> {order.metadata?.total_items || 0}
                    </p>
                    {order.pickup_time && (
                      <p className="text-sm">
                        <strong>Pickup Time:</strong> {format(new Date(order.pickup_time), 'PPp')}
                      </p>
                    )}
                    {order.delivery_notes && (
                      <p className="text-sm">
                        <strong>Notes:</strong> {order.delivery_notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cart Items */}
                {order.metadata?.cart_items && order.metadata.cart_items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Items Ordered</h4>
                    <div className="space-y-2">
                      {order.metadata.cart_items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.farmName}</p>
                          </div>
                          <p className="text-sm">Qty: {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <label className="text-sm font-medium">Update Status:</label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};