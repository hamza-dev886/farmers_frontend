import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from 'zod';
import { User, UserPlus, Sprout } from "lucide-react";

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password must be less than 100 characters" }),
  confirmPassword: z.string(),
  fullName: z.string().trim().min(1, { message: "Full name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  phone: z.string().trim().optional(),
  role: z.enum(['customer', 'farmer', 'admin'], { message: "Please select a valid role" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Signup form state
  const [signupForm, setSignupForm] = useState<SignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'customer'
  });
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginErrors({});

    try {
      // Validate form
      const validatedData = loginSchema.parse(loginForm);

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Invalid email or password. Please try again."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.message
          });
        }
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in."
      });

      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setLoginErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "An unexpected error occurred. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupErrors({});

    try {
      // Validate form
      const validatedData = signupSchema.parse(signupForm);

      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: validatedData.fullName,
            phone: validatedData.phone || null,
            role: validatedData.role
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Signup failed",
            description: "An account with this email already exists. Please try logging in instead."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Signup failed",
            description: error.message
          });
        }
        return;
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account."
      });

      // Switch to login tab
      setActiveTab("login");
      setLoginForm({ email: validatedData.email, password: '' });

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setSignupErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "An unexpected error occurred. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <User className="w-4 h-4" />;
      case 'farmer':
        return <Sprout className="w-4 h-4" />;
      default:
        return <UserPlus className="w-4 h-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Manage the platform and oversee operations';
      case 'farmer':
        return 'List your farm and sell products directly to customers';
      case 'customer':
        return 'Browse farms and purchase fresh local products';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-green/5 to-farm-gold/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-farm-green mb-2">Farm Connect</h1>
          <p className="text-muted-foreground">Your local farming marketplace</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Login Tab */}
              <TabsContent value="login">
                <div className="space-y-4">
                  <CardDescription>
                    Welcome back! Please sign in to your account.
                  </CardDescription>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className={loginErrors.email ? "border-destructive" : ""}
                        disabled={isLoading}
                      />
                      {loginErrors.email && (
                        <p className="text-sm text-destructive">{loginErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className={loginErrors.password ? "border-destructive" : ""}
                        disabled={isLoading}
                      />
                      {loginErrors.password && (
                        <p className="text-sm text-destructive">{loginErrors.password}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <div className="space-y-4">
                  <CardDescription>
                    Create your account and join our farming community.
                  </CardDescription>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-role">Account Type</Label>
                      <Select
                        value={signupForm.role}
                        onValueChange={(value: 'customer' | 'farmer' | 'admin') => 
                          setSignupForm({ ...signupForm, role: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={signupErrors.role ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">
                            <div className="flex items-center gap-2">
                              {getRoleIcon('customer')}
                              <div>
                                <div className="font-medium">Customer</div>
                                <div className="text-xs text-muted-foreground">
                                  {getRoleDescription('customer')}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="farmer">
                            <div className="flex items-center gap-2">
                              {getRoleIcon('farmer')}
                              <div>
                                <div className="font-medium">Farmer</div>
                                <div className="text-xs text-muted-foreground">
                                  {getRoleDescription('farmer')}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              {getRoleIcon('admin')}
                              <div>
                                <div className="font-medium">Administrator</div>
                                <div className="text-xs text-muted-foreground">
                                  {getRoleDescription('admin')}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {signupErrors.role && (
                        <p className="text-sm text-destructive">{signupErrors.role}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-fullName">Full Name</Label>
                      <Input
                        id="signup-fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                        className={signupErrors.fullName ? "border-destructive" : ""}
                        disabled={isLoading}
                      />
                      {signupErrors.fullName && (
                        <p className="text-sm text-destructive">{signupErrors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className={signupErrors.email ? "border-destructive" : ""}
                        disabled={isLoading}
                      />
                      {signupErrors.email && (
                        <p className="text-sm text-destructive">{signupErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone (Optional)</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                        className={signupErrors.phone ? "border-destructive" : ""}
                        disabled={isLoading}
                      />
                      {signupErrors.phone && (
                        <p className="text-sm text-destructive">{signupErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className={signupErrors.password ? "border-destructive" : ""}
                        disabled={isLoading}
                      />
                      {signupErrors.password && (
                        <p className="text-sm text-destructive">{signupErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                      <Input
                        id="signup-confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        className={signupErrors.confirmPassword ? "border-destructive" : ""}
                        disabled={isLoading}
                      />
                      {signupErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{signupErrors.confirmPassword}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;