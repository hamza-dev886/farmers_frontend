import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wheat, User, Building, Leaf, X, Plus, Twitter, Facebook, Instagram } from "lucide-react";
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
  joiningType: z.enum(["farm", "stall"]),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
  email: z.string().min(1, "Email is required"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number cannot be longer than 15 characters")
    .refine(
      (value) => /^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(value),
      "Please enter a valid US phone number (e.g. +1 (555) 123-4567)"
    ),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  farmAddress: z.string().min(10, "Please provide a detailed address"),
  farmType: z.string(),
  farmImage: z.string().optional(),
  farmCoordinates: z.array(z.number()).optional(),
  farmBio: z.string().min(50, "Please provide at least 50 characters describing your farm"),
  socialLinks: z.array(z.object({
    platform: z.enum(["facebook", "twitter", "instagram"]).nullable(),
    url: z.string().url("Please enter a valid URL").or(z.literal("")).nullable(),
  }).optional()).nullable(),
  products: z.array(z.string()).min(1, "Please select at least one product type"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FarmerApplicationForm = z.infer<typeof farmerApplicationSchema>;

const socialPlatforms = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "instagram", label: "Instagram", icon: Instagram }
];

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
  const [farmAddressInput, setFarmAddressInput] = useState<string>("");
  const [farmImageFile, setFarmImageFile] = useState<File | null>(null);
  const [farmImagePreview, setFarmImagePreview] = useState<string | null>(null);
  const [socialLinksCount, setSocialLinksCount] = useState(1);

  // Reset image state when modal closes
  const handleModalChange = (open: boolean) => {
    if (!open) {
      setFarmImageFile(null);
      setFarmImagePreview(null);
    }
    onOpenChange(open);
  };
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
      joiningType: 'farm',
      contactPerson: "",
      email: "",
      phone: "",
      farmName: "",
      farmAddress: "",
      password: "",
      confirmPassword: "",
      farmType: "",
      farmCoordinates: undefined,
      farmBio: "",
      socialLinks: [{ platform: "facebook", url: "" }],
      products: [],
      termsAccepted: false,
    },
  });

  const joiningType = form.watch('joiningType');
  const isFarm = joiningType === 'farm';

  const onSubmit = async (data: FarmerApplicationForm) => {
    setIsSubmitting(true);

    try {
      // Generate temporary password
      // const tempPassword = generatePassword();

      // Create user account with temporary password using regular signup

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.contactPerson,
            role: "farmer",
            type: data.joiningType,
            password_expired: true
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      let imageUrl = '';
      if (farmImageFile) {
        const fileExt = farmImageFile.name.split('.').pop();
        const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('farmers_bucket')
          .upload(fileName, farmImageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: farmImageFile.type,
          });
        if (uploadError) throw uploadError;
        imageUrl = fileName;
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
          farm_type: data.farmType,
          type: data.joiningType,
          farm_coordinates: farmCoordinates,
          farm_bio: data.farmBio,
          products: data.products,
          approval_status: 'pending',
          user_id: authData.user.id,
          social_links: data.socialLinks,
          farm_image_url: imageUrl
        });

      if (applicationError) throw applicationError;
      toast({
        title: "Application submitted successfully!",
        description: `Your application has been submitted with email: ${data.email}.Please check your email for confirmation.`,
        duration: 15000,
      });

      form.reset();
      setFarmImageFile(null);
      setFarmImagePreview(null);
      handleModalChange(false);
    } catch (error: any) {
      console.error('Error submitting application:', error);

      let errorMessage = "There was an issue submitting your application. Please try again.";

      // Handle specific email validation errors
      if (error.message?.includes("email_address_invalid") || (error.message?.includes("Email address") && error.message?.includes("invalid"))) {
        errorMessage = "The email address you entered appears to be invalid or blocked by our system. Please try using a different email address (Gmail, Yahoo, Outlook, etc.) or contact support if you believe this is an error.";
      } else if (error.message?.includes("email_rate_limit_exceeded")) {
        errorMessage = "Too many signup attempts. Please wait a few minutes before trying again.";
      } else if (error.message?.includes("signup_disabled")) {
        errorMessage = "New signups are temporarily disabled. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Submission Error",
        description: errorMessage,
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
    <Dialog open={open} onOpenChange={handleModalChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* Header */}
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl text-farm-green flex items-center justify-center gap-2">
                <Leaf className="h-6 w-6" />
                {isFarm ? 'Join Our Farming Community' : 'Join Our Stall Network'}
              </DialogTitle>
              <DialogDescription className="text-lg max-w-2xl mx-auto">
                {isFarm ? (
                  <>Join our platform to connect directly with local customers, showcase your fresh produce, and grow your farming business. We support sustainable agriculture and fair trade practices.</>
                ) : (
                  <>Join as a stall to sell products directly at market stalls and pop-ups. Connect with local farms, manage inventory, and meet customers in person.</>
                )}
              </DialogDescription>
              <div className="flex justify-center gap-3 my-4">
                {([['farm', 'Join as Farm'], ['stall', 'Join as Stall']] as [string, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => form.setValue('joiningType', value as 'farm' | 'stall')}
                    className={`px-4 py-2 rounded-full font-semibold ${form.watch('joiningType') === value ? 'bg-farm-green text-white' : 'bg-muted text-muted-foreground'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </DialogHeader>

            {/* Application Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex-1 space-y-4">
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
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, "");
                                value = value.slice(0, 11);
                                if (value.length > 0) {
                                  if (value.startsWith("1")) {
                                    value = value.slice(1);
                                  }
                                  // Format the remaining digits
                                  if (value.length > 0) {
                                    if (value.length <= 10) {
                                      value = value.replace(/(\d{0,3})(\d{0,3})(\d{0,4})/, (_, p1, p2, p3) => {
                                        let parts = [];
                                        if (p1) parts.push(`(${p1}`);
                                        if (p2) parts.push(`${p1 ? ") " : "("}${p2}`);
                                        if (p3) parts.push(`${p2 ? "-" : ") "}${p3}`);
                                        return parts.join("");
                                      });
                                    }
                                    // Always prepend +1
                                    value = "+1 " + value;
                                  }
                                }
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="*********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm password <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="*********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="farmType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isFarm ? 'Farm Type' : 'Stall Type'} <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder={isFarm ? "e.g. Dairy" : "e.g. Market Stall Type"}
                              {...field}
                              value={typeof field.value === 'string' ? field.value : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      {/* Social Links */}
                      <h3 className="text-lg font-semibold text-farm-green flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Social Media Links
                      </h3>
                      <div className="space-y-4">
                        {[...Array(socialLinksCount)].map((_, index) => {
                          return (
                            <div key={index} className="flex flex-col">
                              <div className="flex flex-row gap-3">
                                <div className="flex-1 space-y-2">
                                  <select
                                    className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm"
                                    value={form.watch(`socialLinks.${index}.platform`)}
                                    onChange={(e) => {
                                      form.setValue(`socialLinks.${index}.platform`, e.target.value as "facebook" | "twitter" | "instagram");
                                    }}
                                  >
                                    {socialPlatforms.map((platform) => (
                                      <option key={platform.value} value={platform.value}>
                                        {platform.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="url"
                                    placeholder="Enter social media profile URL"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    {...form.register(`socialLinks.${index}.url`)}
                                  />
                                  {form.formState.errors.socialLinks?.[index]?.url && (
                                    <p className="text-sm text-destructive">{form.formState.errors.socialLinks[index]?.url?.message}</p>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {index > 0 && (
                                    <X className="h-4 w-4 text-black"
                                      onClick={() => {
                                        setSocialLinksCount(prev => prev - 1);
                                        const currentLinks = form.getValues("socialLinks") || [];
                                        currentLinks.splice(index, 1);
                                        form.setValue("socialLinks", currentLinks);
                                      }} />
                                  )}
                                </div>
                              </div>
                              {(index + 1) === socialLinksCount && index < 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-36 mt-3 bg-farm-green text-white"
                                  onClick={() => {
                                    setSocialLinksCount(prev => prev + 1);
                                    const currentLinks = form.getValues("socialLinks") || [];
                                    form.setValue("socialLinks", [...currentLinks, { platform: "facebook", url: "" }]);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />    Add Social link
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Farm Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-farm-green flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {isFarm ? 'Farm Information' : 'Stall Information'}
                    </h3>

                    <FormField
                      control={form.control}
                      name="farmName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isFarm ? 'Farm Name' : 'Stall Name'} <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder={isFarm ? "e.g., Green Valley Farm" : "e.g., Downtown Market Stall"} {...field} />
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
                          <FormLabel>{isFarm ? 'Farm Address' : 'Stall Address'} <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <MapboxAutocomplete
                                value={farmAddressInput || field.value}
                                onChange={(address, coordinates) => {
                                  console.log('Form address changed:', address, 'Coordinates:', coordinates);
                                  setFarmAddressInput(address || "");
                                  field.onChange(address);
                                  setFarmCoordinates(coordinates || null);
                                  console.log('Farm coordinates state set to:', coordinates);
                                }}
                                placeholder="Search for your farm address..."
                                className="min-h-[40px]"
                              />
                              <MapboxMapPreview
                                coordinates={farmCoordinates}
                                onSelect={(coords, placeName) => {
                                  console.log('Map pick received:', coords, placeName);
                                  setFarmCoordinates(coords);
                                  // Update the visible autocomplete input so users see the picked address
                                  if (placeName) {
                                    setFarmAddressInput(placeName);
                                  }
                                  // Update form values for coordinates and address if available
                                  try {
                                    form.setValue('farmCoordinates', coords as unknown as number[]);
                                    if (placeName) {
                                      form.setValue('farmAddress', placeName);
                                    }
                                  } catch (e) {
                                    console.error('Error setting form values from map pick:', e);
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-center">
                      <div className="flex-1 flex flex-col items-center justify-center bg-farm-cream/60 rounded-lg p-4 border border-farm-green-light">
                        <FormLabel className="font-semibold text-farm-green flex items-center gap-2 mb-2 justify-center">
                          <Wheat className="h-5 w-5" /> {isFarm ? 'Farm Logo' : 'Stall Logo'}
                        </FormLabel>
                        <div className="flex flex-col items-center gap-2 justify-center">
                          <div className="w-24 h-24 rounded-full bg-farm-green/10 flex items-center justify-center mb-2 border border-farm-green-light overflow-hidden">
                            {farmImagePreview ? (
                              <img src={farmImagePreview} alt="Farm Preview" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <Wheat className="h-10 w-10 text-farm-green/40" />
                            )}
                          </div>
                          <div className="flex flex-col items-center w-full">
                            <label htmlFor="farm-image-upload" className="cursor-pointer inline-block px-4 py-2 bg-farm-green text-white rounded-full font-semibold text-sm mb-1 hover:bg-farm-green-light transition">
                              Choose File
                            </label>
                            <input
                              id="farm-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0] || null;
                                setFarmImageFile(file);
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setFarmImagePreview(reader.result as string);
                                  reader.readAsDataURL(file);
                                } else {
                                  setFarmImagePreview(null);
                                }
                              }}
                            />
                            <span className="text-xs text-muted-foreground mt-1">
                              {farmImageFile ? farmImageFile.name : 'No file chosen'}
                            </span>
                          </div>
                          {farmImagePreview && (
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="mt-1"
                              onClick={() => { setFarmImageFile(null); setFarmImagePreview(null); }}
                            >Remove</Button>
                          )}
                          <span className="text-xs text-muted-foreground text-center mt-2">Upload a clear image of your {isFarm ? 'farm' : 'stall'}.<br />Supported formats: JPG, PNG, GIF.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farm Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-farm-green flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    {isFarm ? 'About Your Farm' : 'About Your Stall'}
                  </h3>

                  <FormField
                    control={form.control}
                    name="farmBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isFarm ? 'Farm Description' : 'Stall Description'} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={isFarm ? "Tell us about your farm, farming practices, history, sustainability efforts, and what makes your products special..." : "Tell us about your stall, where you operate, typical events/markets, and what makes your offerings unique..."}
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
                  <p className="text-sm text-muted-foreground">Select all product types that apply to your {isFarm ? 'farm' : 'stall'}:</p>

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
                  <h4 className="font-semibold mb-1 text-sm">{isFarm ? 'Farm Verification' : 'Stall Verification'}</h4>
                  <p className="text-xs text-muted-foreground">
                    Approved applicants undergo {isFarm ? 'farm' : 'stall'} verification process
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    3
                  </div>
                  <h4 className="font-semibold mb-1 text-sm">Get Started</h4>
                  <p className="text-xs text-muted-foreground">
                    Set up your {isFarm ? 'farm' : 'stall'} profile and start connecting with customers
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