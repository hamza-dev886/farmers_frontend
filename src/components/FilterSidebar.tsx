import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCategories, Category } from "@/services/categoryService";

interface FilterFormData {
  categories: string[];
  subCategories: string[];
  farmTypes: string[];
  distances: string[];
  features: string[];
}
import { supabase } from "@/integrations/supabase/client";

export const FilterSidebar = () => {
  const [openSections, setOpenSections] = useState({
    farmType: true,
    products: true,
    distance: true,
    features: true
  });

  const [openProducts, setOpenProducts] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FilterFormData>({
    categories: [],
    subCategories: [],
    farmTypes: [],
    distances: [],
    features: []
  });

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

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => {
      const newCategories = checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId);
      
      // If unchecking a category, also uncheck all its subcategories
      if (!checked) {
        const category = products?.find((p: any) => p.id === categoryId);
        const subCategoryIds = category?.sub_categories?.map((sub: any) => sub.id) || [];
        
        return {
          ...prev,
          categories: newCategories,
          subCategories: prev.subCategories.filter(id => !subCategoryIds.includes(id))
        };
      }
      
      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  const handleSubCategoryChange = (subCategoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subCategories: checked 
        ? [...prev.subCategories, subCategoryId]
        : prev.subCategories.filter(id => id !== subCategoryId)
    }));
  };

  const handleFarmTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      farmTypes: checked 
        ? [...prev.farmTypes, type]
        : prev.farmTypes.filter(t => t !== type)
    }));
  };

  const handleDistanceChange = (distance: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      distances: checked 
        ? [...prev.distances, distance]
        : prev.distances.filter(d => d !== distance)
    }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Filter form data:', formData);
    // Add your filter logic here
  };

  const handleClearAll = () => {
    setFormData({
      categories: [],
      subCategories: [],
      farmTypes: [],
      distances: [],
      features: []
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      
      if (data) {
        setProducts(data);
      }
    };

    loadCategories();
  }, []);


  useEffect(()=>{
    console.log('Form Data Updated:', formData);
  },[formData])

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="text-sm h-8 px-3"
          onClick={handleClearAll}
        >
          Clear All
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Checkbox 
            id="organic-quick" 
            checked={formData.features.includes('organic')}
            onCheckedChange={(checked) => handleFeatureChange('organic', checked as boolean)}
          />
          <label htmlFor="organic-quick" className="text-sm font-medium cursor-pointer">Organic</label>
          <Badge variant="secondary" className="text-xs h-5 px-2">156</Badge>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox 
            id="nearby-quick" 
            checked={formData.distances.includes('5')}
            onCheckedChange={(checked) => handleDistanceChange('5', checked as boolean)}
          />
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
              <Checkbox 
                id="family-farm" 
                checked={formData.farmTypes.includes('family-farm')}
                onCheckedChange={(checked) => handleFarmTypeChange('family-farm', checked as boolean)}
              />
              <label htmlFor="family-farm" className="text-xs">Family Farms</label>
              <Badge variant="secondary" className="ml-auto text-xs h-4 px-1">156</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="farm-stall" 
                checked={formData.farmTypes.includes('farm-stall')}
                onCheckedChange={(checked) => handleFarmTypeChange('farm-stall', checked as boolean)}
              />
              <label htmlFor="farm-stall" className="text-xs">Farm Stalls</label>
              <Badge variant="secondary" className="ml-auto text-xs h-4 px-1">89</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="farm-events" 
                checked={formData.farmTypes.includes('farm-events')}
                onCheckedChange={(checked) => handleFarmTypeChange('farm-events', checked as boolean)}
              />
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
            {products && products.map((product: any) => (
              <Collapsible
                key={product.id}
                open={openProducts[product.id]}
                onOpenChange={() => toggleProduct(product.id)}
              >
                <div className="flex items-start justify-between space-x-2 w-full hover:bg-muted/50 rounded px-1 py-1">
                  <div className="flex flex-row gap-4 items-center">
                    <Checkbox
                      id={product.id}
                      checked={formData.categories.includes(product.id)}
                      onCheckedChange={(checked) => handleCategoryChange(product.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <CollapsibleTrigger asChild>
                      <span className="text-xs flex-1 cursor-pointer">
                        {product.name}
                      </span>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleTrigger asChild>
                    <button type="button" className="p-1 hover:bg-muted rounded">
                      {openProducts[product.id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="ml-6 mt-1 space-y-1">
                  {product.sub_categories.map((subCategory: any) => (
                    <div key={subCategory.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={subCategory.id} 
                        checked={formData.subCategories.includes(subCategory.id)}
                        onCheckedChange={(checked) => handleSubCategoryChange(subCategory.id, checked as boolean)}
                      />
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
              <Checkbox 
                id="nearby" 
                checked={formData.distances.includes('5')}
                onCheckedChange={(checked) => handleDistanceChange('5', checked as boolean)}
              />
              <label htmlFor="nearby" className="text-xs">Within 5 miles</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="local" 
                checked={formData.distances.includes('15')}
                onCheckedChange={(checked) => handleDistanceChange('15', checked as boolean)}
              />
              <label htmlFor="local" className="text-xs">Within 15 miles</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="regional" 
                checked={formData.distances.includes('30')}
                onCheckedChange={(checked) => handleDistanceChange('30', checked as boolean)}
              />
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
              <Checkbox 
                id="organic" 
                checked={formData.features.includes('organic')}
                onCheckedChange={(checked) => handleFeatureChange('organic', checked as boolean)}
              />
              <label htmlFor="organic" className="text-xs">Organic Certified</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="family-owned" 
                checked={formData.features.includes('family-owned')}
                onCheckedChange={(checked) => handleFeatureChange('family-owned', checked as boolean)}
              />
              <label htmlFor="family-owned" className="text-xs">Family Owned</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="farm-tours" 
                checked={formData.features.includes('farm-tours')}
                onCheckedChange={(checked) => handleFeatureChange('farm-tours', checked as boolean)}
              />
              <label htmlFor="farm-tours" className="text-xs">Farm Tours</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="csa" 
                checked={formData.features.includes('csa')}
                onCheckedChange={(checked) => handleFeatureChange('csa', checked as boolean)}
              />
              <label htmlFor="csa" className="text-xs">CSA Program</label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Separator />

      <Button type="submit" className="w-full h-8 text-xs">
        Apply Filters
      </Button>
    </form>
  );
};