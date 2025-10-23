import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const FilterSidebar = () => {
  const [openSections, setOpenSections] = useState({
    farmType: true,
    products: true,
    distance: true,
    features: true
  });

  const [openProducts, setOpenProducts] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<any>()

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleProduct = (category: string) => {
    setOpenProducts(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await (supabase as any)
        .from('categories')
        .select(`
        id,
        name,
        sub_categories:sub_categories_category_id_fkey (
          id,
          name
        )
      `)
      .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      console.log('Fetched categories:', data);

      if (data) {
        setProducts(data)
      }
    };

    fetchCategories();
  }, []);


  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" className="text-sm h-8 px-3">
          Clear All
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Checkbox id="organic-quick" />
          <label htmlFor="organic-quick" className="text-sm font-medium cursor-pointer">Organic</label>
          <Badge variant="secondary" className="text-xs h-5 px-2">156</Badge>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox id="nearby-quick" />
          <label htmlFor="nearby-quick" className="text-sm font-medium cursor-pointer">Within 5 miles</label>
          <Badge variant="secondary" className="text-xs h-5 px-2">89</Badge>
        </div>
      </div>

      <Separator />

      {/* Collapsible Sections */}
      <div className="space-y-2">
        {/* Farm Type */}
        <Collapsible open={openSections.farmType} onOpenChange={() => toggleSection('farmType')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded text-sm">
            <span className="font-medium">Farm Type</span>
            {openSections.farmType ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 pb-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="family-farm" />
              <label htmlFor="family-farm" className="text-xs">Family Farms</label>
              <Badge variant="secondary" className="ml-auto text-xs h-4 px-1">156</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="farm-stall" />
              <label htmlFor="farm-stall" className="text-xs">Farm Stalls</label>
              <Badge variant="secondary" className="ml-auto text-xs h-4 px-1">89</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="farm-events" />
              <label htmlFor="farm-events" className="text-xs">Farm Events</label>
              <Badge variant="secondary" className="ml-auto text-xs h-4 px-1">34</Badge>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Products */}
        <Collapsible open={openSections.products} onOpenChange={() => toggleSection('products')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded text-sm">
            <span className="font-medium">Products</span>
            {openSections.products ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 pb-2 space-y-2">
            {products && products.map((product) => (
              <Collapsible
                key={product.id}
                open={openProducts[product.id]}
                onOpenChange={() => toggleProduct(product.id)}
              >
                <CollapsibleTrigger className="flex items-start justify-between space-x-2 w-full hover:bg-muted/50 rounded px-1 py-1">
                  <div className="flex flex-row gap-4">
                    <Checkbox
                      id={product.id}
                      checked={openProducts[product.id]}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <label htmlFor={product.id} className="text-xs flex-1 cursor-pointer">
                      {product.name}
                    </label>
                  </div>
                  {openProducts[product.id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 mt-1 space-y-1">
                  {product.sub_categories.map((subCategory) => (
                    <div key={subCategory.id} className="flex items-center space-x-2">
                      <Checkbox id={subCategory.id} />
                      <label
                        htmlFor={subCategory.id}
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        {subCategory.name}
                      </label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Distance */}
        <Collapsible open={openSections.distance} onOpenChange={() => toggleSection('distance')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded text-sm">
            <span className="font-medium">Distance</span>
            {openSections.distance ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 pb-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="nearby" />
              <label htmlFor="nearby" className="text-xs">Within 5 miles</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="local" />
              <label htmlFor="local" className="text-xs">Within 15 miles</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="regional" />
              <label htmlFor="regional" className="text-xs">Within 30 miles</label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Features */}
        <Collapsible open={openSections.features} onOpenChange={() => toggleSection('features')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded text-sm">
            <span className="font-medium">Features</span>
            {openSections.features ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 pb-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="organic" />
              <label htmlFor="organic" className="text-xs">Organic Certified</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="family-owned" />
              <label htmlFor="family-owned" className="text-xs">Family Owned</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="farm-tours" />
              <label htmlFor="farm-tours" className="text-xs">Farm Tours</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="csa" />
              <label htmlFor="csa" className="text-xs">CSA Program</label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Separator />

      <Button className="w-full h-8 text-xs">
        Apply Filters
      </Button>
    </div>
  );
};