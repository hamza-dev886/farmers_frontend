import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);
  const [farmPricingPlans, setFarmPricingPlans] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Fetch pricing plans for all farms in cart
  useEffect(() => {
    const fetchFarmPricingPlans = async () => {
      const uniqueFarmIds = [...new Set(items.map(item => item.farmId))];
      
      if (uniqueFarmIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const pricingPromises = uniqueFarmIds.map(async (farmId) => {
          // Get farm info to find farmer_id
          const { data: farmData } = await supabase
            .from('farms')
            .select('farmer_id')
            .eq('id', farmId)
            .single();

          if (farmData) {
            // Get farmer's pricing plan
            const { data: pricingData } = await supabase
              .from('farm_pricing_plans')
              .select(`
                pricing_plans (
                  transaction_fee,
                  name
                )
              `)
              .eq('user_id', farmData.farmer_id)
              .eq('is_active', true)
              .single();

            return {
              farmId,
              pricingPlan: pricingData?.pricing_plans || { transaction_fee: 0.05, name: 'Default' }
            };
          }
          return { farmId, pricingPlan: { transaction_fee: 0.05, name: 'Default' } };
        });

        const results = await Promise.all(pricingPromises);
        const pricingMap = results.reduce((acc, result) => {
          acc[result.farmId] = result.pricingPlan;
          return acc;
        }, {} as Record<string, any>);

        setFarmPricingPlans(pricingMap);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
        // Set default pricing plans
        const defaultPricing = uniqueFarmIds.reduce((acc, farmId) => {
          acc[farmId] = { transaction_fee: 0.05, name: 'Default' };
          return acc;
        }, {} as Record<string, any>);
        setFarmPricingPlans(defaultPricing);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmPricingPlans();
  }, [items]);

  // Calculate totals with safety checks
  const subtotal = items.reduce((total, item) => {
    const price = item.price || 0;
    return total + (price * item.quantity);
  }, 0);
  
  const transactionFees = items.reduce((total, item) => {
    const price = item.price || 0;
    const pricingPlan = farmPricingPlans[item.farmId];
    if (pricingPlan && price > 0) {
      const itemTotal = price * item.quantity;
      return total + (itemTotal * pricingPlan.transaction_fee);
    }
    return total;
  }, 0);
  const totalAmount = subtotal + transactionFees;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      toast.success("Item removed from cart");
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string, itemTitle: string) => {
    removeFromCart(itemId);
    toast.success(`${itemTitle} removed from cart`);
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      clearCart();
      toast.success("Cart cleared successfully");
    } finally {
      setIsClearing(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>
        
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start shopping to add items to your cart
              </p>
              <Button onClick={() => navigate('/')} variant="farm">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <span className="text-muted-foreground">({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'})</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">From {item.farmName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id, item.title)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Item price */}
                      <div className="text-right">
                        {item.price && item.price > 0 ? (
                          <>
                            <div className="font-semibold text-lg">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} each
                            </div>
                            {item.compare_at_price && item.compare_at_price > item.price && (
                              <div className="text-xs text-muted-foreground line-through">
                                ${item.compare_at_price.toFixed(2)} each
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Price not available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Calculating totals...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Subtotal ({getTotalItems()} items):</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {transactionFees > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Transaction fees:</span>
                        <span className="text-muted-foreground">${transactionFees.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleCheckout}
                      variant="farm" 
                      className="w-full"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <Button
                      onClick={handleClearCart}
                      disabled={isClearing}
                      variant="outline"
                      className="w-full"
                    >
                      {isClearing ? "Clearing..." : "Clear Cart"}
                    </Button>
                    
                    <Button
                      onClick={() => navigate('/')}
                      variant="ghost"
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
}