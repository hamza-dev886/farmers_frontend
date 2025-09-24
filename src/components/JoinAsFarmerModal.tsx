import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wheat, User, Building, Leaf, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapboxAutocomplete } from "@/components/ui/mapbox-autocomplete";
import { MapboxMapPreview } from "@/components/ui/mapbox-map-preview";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const farmerApplicationSchema = z.object({
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  farmAddress: z.string().min(10, "Please provide a detailed address"),
  farmCoordinates: z.array(z.number()).optional(),
  farmBio: z.string().min(50, "Please provide at least 50 characters describing your farm"),
  products: z.array(z.string()).min(1, "Please select at least one product type"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

type FarmerApplicationForm = z.infer<typeof farmerApplicationSchema>;

const productOptions = [
  "Fruits", "Vegetables", "Herbs", "Dairy Products", "Eggs", 
  "Meat & Poultry", "Grains & Cereals", "Honey & Bee Products",
  "Flowers & Plants", "Preserved Foods", "Organic Products", "Firewood", "Not Listed"
];

interface JoinAsFarmerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinAsFarmerModal({ open, onOpenChange }: JoinAsFarmerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmCoordinates, setFarmCoordinates] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure it meets requirements
    return 'Farmer' + password + '123';
  };

  const form = useForm<FarmerApplicationForm>({
    resolver: zodResolver(farmerApplicationSchema),
    defaultValues: {
      contactPerson: "",
      email: "",
      phone: "",
      farmName: "",
      farmAddress: "",
      farmCoordinates: undefined,
      farmBio: "",
      products: [],
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: FarmerApplicationForm) => {
    setIsSubmitting(true);
    
    try {
      // Generate temporary password
      const tempPassword = generatePassword();

      // Create user account with temporary password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.contactPerson,
            role: 'farmer',
            password_expired: true
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // Submit farmer application with the new user's ID
      const { error: applicationError } = await supabase
        .from('farmer_applications')
        .insert({
          contact_person: data.contactPerson,
          email: data.email,
          phone: data.phone,
          farm_name: data.farmName,
          farm_address: data.farmAddress,
          farm_coordinates: farmCoordinates,
          farm_bio: data.farmBio,
          products: data.products,
          approval_status: 'pending',
          user_id: authData.user.id
        });

      if (applicationError) throw applicationError;

      toast({
        title: "Account created successfully!",
        description: `Your farmer account has been created with email: ${data.email}. Your temporary password is: ${tempPassword}. Please save this and change it on first login.`,
        duration: 15000,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Error",
        description: error.message || "There was an issue submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductChange = (product: string, checked: boolean) => {
    const currentProducts = form.getValues("products");
    if (checked) {
      form.setValue("products", [...currentProducts, product]);
    } else {
      form.setValue("products", currentProducts.filter(p => p !== product));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* Header */}
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl text-farm-green flex items-center justify-center gap-2">
                <Leaf className="h-6 w-6" />
                Join Our Farming Community
              </DialogTitle>
              <DialogDescription className="text-lg max-w-2xl mx-auto">
                Join our platform to connect directly with local customers, showcase your fresh produce, 
                and grow your farming business. We support sustainable agriculture and fair trade practices.
              </DialogDescription>
            </DialogHeader>

            {/* Application Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-farm-green flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Full name of primary contact" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your.email@example.com"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+1 (555) 123-4567"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Farm Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-farm-green flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Farm Information
                    </h3>

                    <FormField
                      control={form.control}
                      name="farmName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Green Valley Farm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="farmAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Address <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <MapboxAutocomplete
                                value={field.value}
                                onChange={(address, coordinates) => {
                                  console.log('Form address changed:', address, 'Coordinates:', coordinates);
                                  field.onChange(address);
                                  setFarmCoordinates(coordinates || null);
                                  console.log('Farm coordinates state set to:', coordinates);
                                }}
                                placeholder="Search for your farm address..."
                                className="min-h-[40px]"
                              />
                              <MapboxMapPreview coordinates={farmCoordinates} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Farm Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-farm-green flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    About Your Farm
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="farmBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm Description <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your farm, farming practices, history, sustainability efforts, and what makes your products special..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Products Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-farm-green">Products You Offer <span className="text-destructive">*</span></h3>
                  <p className="text-sm text-muted-foreground">Select all product types that apply to your farm:</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {productOptions.map((product) => (
                      <div key={product} className="flex items-center space-x-2">
                        <Checkbox
                          id={product}
                          checked={form.watch("products").includes(product)}
                          onCheckedChange={(checked) => 
                            handleProductChange(product, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={product}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {product}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {form.formState.errors.products && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.products.message}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            I agree to the terms and conditions <span className="text-destructive">*</span>
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            By checking this box, you agree to our platform guidelines, 
                            quality standards, and partnership agreement.
                          </p>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center gap-3 pt-4 border-t">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !form.watch("termsAccepted")}
                    className="min-w-[150px] bg-gradient-to-r from-farm-green to-farm-green-light hover:from-farm-green-light hover:to-farm-green transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>

            {/* Additional Information */}
            <div className="mt-6 p-4 bg-farm-cream/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-farm-green">What Happens Next?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    1
                  </div>
                  <h4 className="font-semibold mb-1 text-sm">Application Review</h4>
                  <p className="text-xs text-muted-foreground">
                    Our team reviews your application within 1-3 business days
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    2
                  </div>
                  <h4 className="font-semibold mb-1 text-sm">Farm Verification</h4>
                  <p className="text-xs text-muted-foreground">
                    Approved applicants undergo farm verification process
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    3
                  </div>
                  <h4 className="font-semibold mb-1 text-sm">Get Started</h4>
                  <p className="text-xs text-muted-foreground">
                    Set up your farm profile and start connecting with customers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}