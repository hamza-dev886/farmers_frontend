import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Leaf, Star, Calendar, Users, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Farm {
  id: string;
  name: string;
  address: string;
  bio?: string;
  contact_person: string;
  email: string;
  phone?: string;
  location?: any;
  created_at: string;
  farmer_id: string;
}

interface Product {
  id: string;
  title: string;
  status: string;
  thumbnail?: string;
  description?: string;
}

const FarmerProfile = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();

  // Fetch farm data
  const { data: farm, isLoading: farmLoading } = useQuery({
    queryKey: ['farm', farmId],
    queryFn: async () => {
      if (!farmId) throw new Error('Farm ID required');
      
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .single();
      
      if (error) throw error;
      return data as Farm;
    },
    enabled: !!farmId
  });

  // Fetch farm products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['farm-products', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      
      const { data, error } = await supabase
        .from('farm_products')
        .select(`
          product_id,
          product:product_id (
            id,
            title,
            status,
            thumbnail,
            description
          )
        `)
        .eq('farm_id', farmId);
      
      if (error) throw error;
      return data.map(item => item.product).filter(Boolean) as Product[];
    },
    enabled: !!farmId
  });

  if (farmLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading farm profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-muted-foreground mb-4">Farm not found</h1>
            <Button onClick={() => navigate('/')}>Back to Farms</Button>
          </div>
        </div>
      </div>
    );
  }

  const farmInitials = farm.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Farm Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24 border-4 border-farm-green/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-farm-green text-white text-2xl font-bold">
                {farmInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{farm.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{farm.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-farm-gold text-farm-gold' : 'text-muted-foreground'}`} />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">(4.2 rating)</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-farm-green/10 text-farm-green">
                    <Leaf className="w-3 h-3 mr-1" />
                    Organic Certified
                  </Badge>
                  <Badge variant="secondary" className="bg-farm-gold/10 text-farm-gold">
                    Local Farm
                  </Badge>
                </div>
              </div>
              
              {farm.bio && (
                <p className="text-muted-foreground leading-relaxed">{farm.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-farm-green" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                <p className="text-foreground">{farm.contact_person}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{farm.email}</p>
              </div>
              {farm.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-foreground">{farm.phone}</p>
                </div>
              )}
              <Separator />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                {farm.phone && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Farm Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-farm-green" />
                Farm Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Products</span>
                <span className="font-semibold">{products.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Years Operating</span>
                <span className="font-semibold">5+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Customers Served</span>
                <span className="font-semibold">500+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Farm Established</span>
                <span className="font-semibold">
                  {new Date(farm.created_at).getFullYear()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Farm Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-farm-green" />
                Farm Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-farm-green rounded-full"></div>
                <span className="text-sm">Organic Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-farm-green rounded-full"></div>
                <span className="text-sm">Locally Grown</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-farm-green rounded-full"></div>
                <span className="text-sm">Sustainable Farming</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-farm-green rounded-full"></div>
                <span className="text-sm">Farm Fresh Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-farm-green rounded-full"></div>
                <span className="text-sm">Family Owned</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-farm-green" />
              Available Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {product.thumbnail && (
                      <img 
                        src={product.thumbnail} 
                        alt={product.title}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-sm mb-2">{product.title}</h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <Badge variant="outline">
                      {product.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={() => navigate('/')} variant="outline">
            Back to All Farms
          </Button>
          <Button className="bg-farm-green hover:bg-farm-green/90">
            Contact This Farm
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FarmerProfile;