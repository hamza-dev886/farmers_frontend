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
          <CardTitle className="text-lg">Property Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="farm" />
            <label htmlFor="farm" className="text-sm">Family Farms</label>
            <Badge variant="secondary" className="ml-auto">156</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="farmstall" />
            <label htmlFor="farmstall" className="text-sm">Farm Stalls</label>
            <Badge variant="secondary" className="ml-auto">89</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="events" />
            <label htmlFor="events" className="text-sm">Farm Events</label>
            <Badge variant="secondary" className="ml-auto">34</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="px-3">
              <Slider
                defaultValue={[50000, 500000]}
                max={1000000}
                min={10000}
                step={10000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>$50K</span>
              <span>$500K</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="small" />
            <label htmlFor="small" className="text-sm">Under 5 acres</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="medium" />
            <label htmlFor="medium" className="text-sm">5-50 acres</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="large" />
            <label htmlFor="large" className="text-sm">50+ acres</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="organic" />
            <label htmlFor="organic" className="text-sm">Organic Certified</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="livestock" />
            <label htmlFor="livestock" className="text-sm">Livestock</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="greenhouse" />
            <label htmlFor="greenhouse" className="text-sm">Greenhouse</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="irrigation" />
            <label htmlFor="irrigation" className="text-sm">Irrigation System</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="storage" />
            <label htmlFor="storage" className="text-sm">Storage Facilities</label>
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