export interface Property {
  id: string;
  title: string;
  type: "farm" | "farmstall";
  location: string;
  image: string;
  size: string;
  description: string;
  features: string[];
  coordinates: [number, number];
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Sunny Valley Family Farm",
    type: "farm",
    location: "Sonoma County, CA",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
    size: "25 acres",
    description: "Family-owned certified organic farm with three generations of farming expertise. We grow seasonal vegetables and offer farm tours.",
    features: ["Organic Certified", "Farm Tours", "Greenhouse", "Family Owned"],
    coordinates: [-122.4, 38.3]
  },
  {
    id: "2",
    title: "Heritage Farm Market",
    type: "farmstall",
    location: "Lancaster County, PA",
    image: "https://images.unsplash.com/photo-1441986380878-c4248f5b8b5b?w=400&h=300&fit=crop",
    size: "2 acres",
    description: "Family-run farm market serving the community for 20+ years. Fresh daily produce, homemade goods, and seasonal events.",
    features: ["Family Business", "Fresh Daily", "Events", "Homemade Goods"],
    coordinates: [-76.3, 40.0]
  },
  {
    id: "3",
    title: "Mountain View Dairy Farm",
    type: "farm",
    location: "Vermont",
    image: "https://images.unsplash.com/photo-1516627145497-ae9cf05a1bec?w=400&h=300&fit=crop",
    size: "85 acres",
    description: "Third-generation family dairy farm with Jersey cows, artisanal cheese making, and weekend farm experiences.",
    features: ["Family Heritage", "Artisanal Cheese", "Farm Tours", "Jersey Cows"],
    coordinates: [-72.6, 44.0]
  },
  {
    id: "4",
    title: "Golden Gate Farmstand",
    type: "farmstall",
    location: "Marin County, CA",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    size: "1.5 acres",
    description: "Family farm stand featuring organic produce, cut flowers, and seasonal specialties. Popular with locals and tourists.",
    features: ["Organic Produce", "Cut Flowers", "Tourist Friendly", "Family Run"],
    coordinates: [-122.5, 37.8]
  },
  {
    id: "5",
    title: "Riverside Berry Farm",
    type: "farm",
    location: "Hood River, OR",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    size: "15 acres",
    description: "Family berry farm in its fourth generation. Pick-your-own berries, farm events, and fresh berry products made on-site.",
    features: ["U-Pick Berries", "Farm Events", "Fresh Products", "4th Generation"],
    coordinates: [-121.5, 45.7]
  },
  {
    id: "6",
    title: "Country Fresh Market",
    type: "farmstall",
    location: "Loudoun County, VA",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop",
    size: "3 acres",
    description: "Multi-generational family market specializing in seasonal produce, farm-fresh eggs, and locally made artisanal products.",
    features: ["Seasonal Produce", "Farm Eggs", "Local Artisans", "Multi-Gen Family"],
    coordinates: [-77.6, 39.1]
  }
];