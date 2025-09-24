import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Wheat, MapPin, Phone, Mail, User, Building, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const farmerApplicationSchema = z.object({
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  farmAddress: z.string().min(10, "Please provide a detailed address"),
  farmBio: z.string().min(50, "Please provide at least 50 characters describing your farm"),
  products: z.array(z.string()).min(1, "Please select at least one product type"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

type FarmerApplicationForm = z.infer<typeof farmerApplicationSchema>;

const productOptions = [
  "Fruits", "Vegetables", "Herbs", "Dairy Products", "Eggs", 
  "Meat & Poultry", "Grains & Cereals", "Honey & Bee Products",
  "Flowers & Plants", "Preserved Foods", "Organic Products"
];

export default function JoinAsFarmer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FarmerApplicationForm>({
    resolver: zodResolver(farmerApplicationSchema),
    defaultValues: {
      contactPerson: "",
      email: "",
      phone: "",
      farmName: "",
      farmAddress: "",
      farmBio: "",
      products: [],
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: FarmerApplicationForm) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('farmer_applications')
        .insert({
          contact_person: data.contactPerson,
          email: data.email,
          phone: data.phone,
          farm_name: data.farmName,
          farm_address: data.farmAddress,
          firm_bio: data.farmBio,
          products: data.products,
          approval_status: 'pending',
          user_id: null, // Will be populated when user creates account
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll review your application and get back to you within 2-3 business days.",
      });

      form.reset();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Error",
        description: "There was an issue submitting your application. Please try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-farm-cream to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Wheat className="h-8 w-8 text-farm-green" />
            <h1 className="text-3xl font-bold text-foreground">Join Our Farming Community</h1>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 border-farm-green/20 shadow-farm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-farm-green flex items-center justify-center gap-2">
              <Leaf className="h-6 w-6" />
              Become a Partner Farmer
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Join our platform to connect directly with local customers, showcase your fresh produce, 
              and grow your farming business. We support sustainable agriculture and fair trade practices.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Application Form */}
        <Card className="max-w-4xl mx-auto shadow-card">
          <CardHeader>
            <CardTitle>Farmer Application Form</CardTitle>
            <CardDescription>
              Please fill out all required information. Our team will review your application within 2-3 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          <FormLabel>Contact Person *</FormLabel>
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
                          <FormLabel>Email Address *</FormLabel>
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
                          <FormLabel>Phone Number *</FormLabel>
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
                          <FormLabel>Farm Name *</FormLabel>
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
                          <FormLabel>Farm Address *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Full address including street, city, state, and postal code"
                              className="min-h-[100px]"
                              {...field} 
                            />
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
                        <FormLabel>Farm Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your farm, farming practices, history, sustainability efforts, and what makes your products special..."
                            className="min-h-[120px]"
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
                  <h3 className="text-lg font-semibold text-farm-green">Products You Offer *</h3>
                  <p className="text-sm text-muted-foreground">Select all product types that apply to your farm:</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                            I agree to the terms and conditions *
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
                <div className="flex justify-end pt-6">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="min-w-[200px] bg-gradient-to-r from-farm-green to-farm-green-light hover:from-farm-green-light hover:to-farm-green transition-smooth"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="max-w-4xl mx-auto mt-8 bg-farm-cream/50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-farm-green">What Happens Next?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-farm-green text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-2">Application Review</h4>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your application within 2-3 business days
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-farm-green text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-2">Farm Visit</h4>
                <p className="text-sm text-muted-foreground">
                  Approved applicants receive a farm visit to verify information
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-farm-green text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-2">Get Started</h4>
                <p className="text-sm text-muted-foreground">
                  Set up your farm profile and start connecting with customers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}