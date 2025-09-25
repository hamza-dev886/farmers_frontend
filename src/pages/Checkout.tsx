import { useState, useEffect } from "react";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Checkout() {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [farmPricingPlans, setFarmPricingPlans] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    deliveryNotes: "",
    pickupTime: ""
  });

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

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setFormData(prev => ({
          ...prev,
          email: session.user.email || ""
        }));
      } else {
        setIsAuthModalOpen(true);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthModalOpen(false);
        setFormData(prev => ({
          ...prev,
          email: session.user.email || ""
        }));
      } else {
        setUser(null);
        setIsAuthModalOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Create order in Supabase
      const orderData = {
        customer_id: user.id,
        email: user.email || formData.email,
        currency_code: 'USD',
        region_id: 'us',
        sales_channel_id: 'organic',
        delivery_notes: formData.deliveryNotes || null,
        pickup_time: formData.pickupTime ? new Date(formData.pickupTime).toISOString() : null,
        status: 'pending',
        metadata: {
          customer_name: formData.firstName + ' ' + formData.lastName,
          phone: formData.phone,
          total_items: getTotalItems(),
          subtotal: subtotal,
          transaction_fees: transactionFees,
          total_amount: totalAmount,
          cart_items: items
        }
      };

      const { data: order, error: orderError } = await supabase
        .from('order')
        .insert(orderData as any)
        .select()
        .single();

      if (orderError) throw orderError;

      clearCart();
      toast.success("Order placed successfully! You will receive a confirmation email shortly.");
      navigate('/');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || "Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.phone;
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to continue with your checkout
            </p>
            <Button onClick={() => setIsAuthModalOpen(true)} variant="farm">
              Sign In
            </Button>
          </div>
        </div>
        <AuthModal 
          open={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          onOpenFarmerModal={() => {}}
        />
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
            onClick={() => navigate('/cart')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryNotes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="deliveryNotes"
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                      placeholder="Any special instructions for your order..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupTime">Preferred Pickup Time (Optional)</Label>
                    <Input
                      id="pickupTime"
                      name="pickupTime"
                      type="datetime-local"
                      value={formData.pickupTime}
                      onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
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
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            <p className="text-xs text-muted-foreground">From {item.farmName}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {item.price && item.price > 0 ? (
                              <>
                                <div className="font-semibold text-sm">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ${item.price.toFixed(2)} each
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                Price not available
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
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
                    
                    <Button 
                      type="submit"
                      onClick={handleSubmit}
                      disabled={!isFormValid() || isProcessing}
                      variant="farm" 
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? "Processing..." : `Place Order - $${totalAmount.toFixed(2)}`}
                    </Button>
                    
                    <Button
                      onClick={() => navigate('/cart')}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Cart
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <AuthModal 
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onOpenFarmerModal={() => {}}
      />
    </>
  );
}