import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const MapFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const filterSections = [
    {
      id: 'type',
      title: 'Farm Type',
      items: [
        { id: 'family-farm', label: 'Family Farms', count: 156 },
        { id: 'farm-stall', label: 'Farm Stalls', count: 89 },
        { id: 'farm-events', label: 'Farm Events', count: 34 },
        { id: 'u-pick', label: 'U-Pick Experiences', count: 28 },
      ]
    },
    {
      id: 'products',
      title: 'Products',
      items: [
        { id: 'vegetables', label: 'Fresh Vegetables' },
        { id: 'fruits', label: 'Seasonal Fruits' },
        { id: 'dairy', label: 'Dairy Products' },
        { id: 'meat', label: 'Farm-Raised Meat' },
        { id: 'eggs', label: 'Fresh Eggs' },
        { id: 'flowers', label: 'Cut Flowers' },
      ]
    },
    {
      id: 'distance',
      title: 'Distance',
      items: [
        { id: 'nearby', label: 'Within 5 miles' },
        { id: 'local', label: 'Within 15 miles' },
        { id: 'regional', label: 'Within 30 miles' },
        { id: 'delivery', label: 'Offers Delivery' },
      ]
    },
    {
      id: 'features',
      title: 'Features',
      items: [
        { id: 'organic', label: 'Organic Certified' },
        { id: 'family-owned', label: 'Family Owned' },
        { id: 'farm-tours', label: 'Farm Tours' },
        { id: 'csa', label: 'CSA Program' },
      ]
    }
  ];

  return (
    <div className="absolute top-4 left-4 z-20 max-w-xs">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
          variant="outline"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      ) : (
        <Card className="bg-background/95 backdrop-blur-sm shadow-xl max-h-[80vh] overflow-y-auto">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {filterSections.map((section) => (
                <Collapsible 
                  key={section.id}
                  open={openSections.includes(section.id)}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-2 h-auto"
                    >
                      <span className="font-medium text-sm">{section.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        openSections.includes(section.id) ? 'rotate-180' : ''
                      }`} />
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-2 pt-2">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox id={item.id} />
                        <label htmlFor={item.id} className="text-sm flex-1">
                          {item.label}
                        </label>
                        {'count' in item && (
                          <Badge variant="secondary" className="text-xs">
                            {item.count}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}

              <div className="pt-4 space-y-2 border-t border-border">
                <Button variant="default" className="w-full" size="sm">
                  Apply Filters
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};