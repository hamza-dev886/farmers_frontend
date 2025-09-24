export interface Property {
  id: string;
  title: string;
  type: "farm" | "farmstall";
  location: string;
  price: string;
  image: string;
  size: string;
  description: string;
  features: string[];
  coordinates: [number, number];
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Sunny Valley Organic Farm",
    type: "farm",
    location: "Sonoma County, CA",
    price: "$475,000",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
    size: "25 acres",
    description: "Certified organic farm with established vegetable production, fruit orchards, and modern irrigation systems.",
    features: ["Organic Certified", "Irrigation", "Greenhouse", "Storage"],
    coordinates: [-122.4, 38.3]
  },
  {
    id: "2",
    title: "Heritage Farm Market",
    type: "farmstall",
    location: "Lancaster County, PA",
    price: "$185,000",
    image: "https://images.unsplash.com/photo-1441986380878-c4248f5b8b5b?w=400&h=300&fit=crop",
    size: "2 acres",
    description: "Established farmstall with loyal customer base, perfect for selling fresh produce and farm goods.",
    features: ["Established Business", "Parking", "Storage", "Display Areas"],
    coordinates: [-76.3, 40.0]
  },
  {
    id: "3",
    title: "Mountain View Dairy Farm",
    type: "farm",
    location: "Vermont",
    price: "$750,000",
    image: "https://images.unsplash.com/photo-1516627145497-ae9cf05a1bec?w=400&h=300&fit=crop",
    size: "85 acres",
    description: "Working dairy farm with modern milking facilities, pasture land, and beautiful mountain views.",
    features: ["Livestock", "Milking Facilities", "Pasture", "Barn"],
    coordinates: [-72.6, 44.0]
  },
  {
    id: "4",
    title: "Golden Gate Farmstand",
    type: "farmstall",
    location: "Marin County, CA",
    price: "$220,000",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    size: "1.5 acres",
    description: "Prime location farmstand near the Golden Gate Bridge, specializing in organic produce and flowers.",
    features: ["Prime Location", "Organic", "Flowers", "Tourist Traffic"],
    coordinates: [-122.5, 37.8]
  },
  {
    id: "5",
    title: "Riverside Berry Farm",
    type: "farm",
    location: "Hood River, OR",
    price: "$390,000",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    size: "15 acres",
    description: "Established berry farm with blueberries, strawberries, and raspberries. Includes u-pick operations.",
    features: ["Berry Production", "U-Pick", "Processing Facility", "Irrigation"],
    coordinates: [-121.5, 45.7]
  },
  {
    id: "6",
    title: "Country Fresh Market",
    type: "farmstall",
    location: "Loudoun County, VA",
    price: "$165,000",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop",
    size: "3 acres",
    description: "Family-owned market with seasonal produce, farm-fresh eggs, and artisanal goods.",
    features: ["Seasonal Produce", "Farm Eggs", "Artisanal Goods", "Family Business"],
    coordinates: [-77.6, 39.1]
  }
];