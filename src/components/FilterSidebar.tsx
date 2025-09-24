import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const FilterSidebar = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Farm Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="family-farm" />
            <label htmlFor="family-farm" className="text-sm">Family Farms</label>
            <Badge variant="secondary" className="ml-auto">156</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="farm-stall" />
            <label htmlFor="farm-stall" className="text-sm">Farm Stalls</label>
            <Badge variant="secondary" className="ml-auto">89</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="farm-events" />
            <label htmlFor="farm-events" className="text-sm">Farm Events</label>
            <Badge variant="secondary" className="ml-auto">34</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="u-pick" />
            <label htmlFor="u-pick" className="text-sm">U-Pick Experiences</label>
            <Badge variant="secondary" className="ml-auto">28</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Products Available</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="vegetables" />
            <label htmlFor="vegetables" className="text-sm">Fresh Vegetables</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="fruits" />
            <label htmlFor="fruits" className="text-sm">Seasonal Fruits</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="dairy" />
            <label htmlFor="dairy" className="text-sm">Dairy Products</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="meat" />
            <label htmlFor="meat" className="text-sm">Farm-Raised Meat</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="eggs" />
            <label htmlFor="eggs" className="text-sm">Fresh Eggs</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="flowers" />
            <label htmlFor="flowers" className="text-sm">Cut Flowers</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="nearby" />
            <label htmlFor="nearby" className="text-sm">Within 5 miles</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="local" />
            <label htmlFor="local" className="text-sm">Within 15 miles</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="regional" />
            <label htmlFor="regional" className="text-sm">Within 30 miles</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="delivery" />
            <label htmlFor="delivery" className="text-sm">Offers Delivery</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Farm Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="organic" />
            <label htmlFor="organic" className="text-sm">Organic Certified</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="family-owned" />
            <label htmlFor="family-owned" className="text-sm">Family Owned</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="farm-tours" />
            <label htmlFor="farm-tours" className="text-sm">Farm Tours</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="csa" />
            <label htmlFor="csa" className="text-sm">CSA Program</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="seasonal-events" />
            <label htmlFor="seasonal-events" className="text-sm">Seasonal Events</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="farm-stand" />
            <label htmlFor="farm-stand" className="text-sm">On-Site Farm Stand</label>
          </div>
        </CardContent>
      </Card>

      <Separator />
      
      <div className="space-y-2">
        <Button variant="farm" className="w-full">
          Apply Filters
        </Button>
        <Button variant="outline" className="w-full">
          Clear All
        </Button>
      </div>
    </div>
  );
};