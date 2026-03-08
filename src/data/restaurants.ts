export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isPopular?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: string;
  address: string;
  isOpen: boolean;
  tags: string[];
  menu: MenuItem[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "confirmed" | "preparing" | "out-for-delivery" | "delivered";
  restaurantName: string;
  estimatedDelivery: string;
  createdAt: Date;
}

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "The Golden Wok",
    cuisine: "Chinese · Asian Fusion",
    rating: 4.7,
    reviewCount: 342,
    deliveryTime: "25-35 min",
    deliveryFee: 40,
    minOrder: 150,
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=400&fit=crop",
    address: "123 Main Street",
    isOpen: true,
    tags: ["Popular", "Free delivery over ₹500"],
    menu: [
      { id: "1-1", name: "Kung Pao Chicken", description: "Spicy stir-fried chicken with peanuts, vegetables, and chili peppers", price: 420, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=200&fit=crop", category: "Mains", isVeg: false, isPopular: true },
      { id: "1-2", name: "Vegetable Spring Rolls", description: "Crispy rolls filled with mixed vegetables", price: 280, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop", category: "Starters", isVeg: true, isPopular: true },
      { id: "1-3", name: "Fried Rice", description: "Wok-tossed rice with eggs, vegetables, and soy sauce", price: 320, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop", category: "Mains", isVeg: true },
      { id: "1-4", name: "Hot & Sour Soup", description: "Traditional spicy and tangy soup with tofu and mushrooms", price: 250, image: "https://images.unsplash.com/photo-1547592166-23ac45744aec?w=300&h=200&fit=crop", category: "Starters", isVeg: true },
      { id: "1-5", name: "Crispy Honey Chicken", description: "Deep-fried chicken tossed in sweet honey glaze", price: 450, image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=200&fit=crop", category: "Mains", isVeg: false },
      { id: "1-6", name: "Mango Pudding", description: "Silky smooth mango flavored dessert", price: 220, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop", category: "Desserts", isVeg: true },
    ],
  },
  {
    id: "2",
    name: "Bella Italia",
    cuisine: "Italian · Pizza · Pasta",
    rating: 4.5,
    reviewCount: 528,
    deliveryTime: "30-40 min",
    deliveryFee: 30,
    minOrder: 200,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    address: "456 Oak Avenue",
    isOpen: true,
    tags: ["Top Rated"],
    menu: [
      { id: "2-1", name: "Margherita Pizza", description: "Classic pizza with fresh mozzarella, tomatoes, and basil", price: 380, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=300&h=200&fit=crop", category: "Pizza", isVeg: true, isPopular: true },
      { id: "2-2", name: "Spaghetti Carbonara", description: "Creamy pasta with pancetta, eggs, and parmesan", price: 450, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&h=200&fit=crop", category: "Pasta", isVeg: false, isPopular: true },
      { id: "2-3", name: "Bruschetta", description: "Toasted bread topped with tomatoes, garlic, and fresh basil", price: 290, image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&h=200&fit=crop", category: "Starters", isVeg: true },
      { id: "2-4", name: "Tiramisu", description: "Classic Italian coffee-flavored layered dessert", price: 310, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop", category: "Desserts", isVeg: true },
      { id: "2-5", name: "Pepperoni Pizza", description: "Loaded with spicy pepperoni and mozzarella cheese", price: 430, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop", category: "Pizza", isVeg: false },
    ],
  },
  {
    id: "3",
    name: "Spice Route",
    cuisine: "Indian · Curry · Biryani",
    rating: 4.8,
    reviewCount: 215,
    deliveryTime: "35-45 min",
    deliveryFee: 20,
    minOrder: 200,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    address: "789 Spice Lane",
    isOpen: true,
    tags: ["New", "Popular"],
    menu: [
      { id: "3-1", name: "Butter Chicken", description: "Tender chicken in rich, creamy tomato-based sauce", price: 480, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop", category: "Mains", isVeg: false, isPopular: true },
      { id: "3-2", name: "Paneer Tikka", description: "Grilled cottage cheese marinated in spiced yogurt", price: 380, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop", category: "Starters", isVeg: true, isPopular: true },
      { id: "3-3", name: "Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken", price: 450, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop", category: "Mains", isVeg: false },
      { id: "3-4", name: "Garlic Naan", description: "Soft flatbread with garlic and butter", price: 200, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop", category: "Breads", isVeg: true },
      { id: "3-5", name: "Gulab Jamun", description: "Deep-fried milk dumplings soaked in sugar syrup", price: 220, image: "https://images.unsplash.com/photo-1666190064491-c78caf0cbb18?w=300&h=200&fit=crop", category: "Desserts", isVeg: true },
    ],
  },
  {
    id: "4",
    name: "Sakura Sushi",
    cuisine: "Japanese · Sushi · Ramen",
    rating: 4.6,
    reviewCount: 189,
    deliveryTime: "20-30 min",
    deliveryFee: 28,
    minOrder: 250,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop",
    address: "321 Cherry Blvd",
    isOpen: true,
    tags: ["Premium"],
    menu: [
      { id: "4-1", name: "Salmon Nigiri Set", description: "Fresh salmon over seasoned rice, 6 pieces", price: 550, image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop", category: "Sushi", isVeg: false, isPopular: true },
      { id: "4-2", name: "Tonkotsu Ramen", description: "Rich pork bone broth with noodles and chashu", price: 480, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop", category: "Ramen", isVeg: false, isPopular: true },
      { id: "4-3", name: "Edamame", description: "Steamed soybeans with sea salt", price: 250, image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?w=300&h=200&fit=crop", category: "Starters", isVeg: true },
      { id: "4-4", name: "California Roll", description: "Crab, avocado, and cucumber roll, 8 pieces", price: 420, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop", category: "Sushi", isVeg: false },
      { id: "4-5", name: "Mochi Ice Cream", description: "Japanese rice cake filled with ice cream, 3 pieces", price: 280, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop", category: "Desserts", isVeg: true },
    ],
  },
  {
    id: "5",
    name: "Burger Barn",
    cuisine: "American · Burgers · Fries",
    rating: 4.3,
    reviewCount: 412,
    deliveryTime: "15-25 min",
    deliveryFee: 22,
    minOrder: 150,
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=400&fit=crop",
    address: "555 Grill Road",
    isOpen: true,
    tags: ["Fast Delivery", "Budget Friendly"],
    menu: [
      { id: "5-1", name: "Classic Smash Burger", description: "Double patty with cheese, lettuce, tomato, and special sauce", price: 350, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop", category: "Burgers", isVeg: false, isPopular: true },
      { id: "5-2", name: "Loaded Fries", description: "Crispy fries topped with cheese, bacon, and jalapeños", price: 280, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop", category: "Sides", isVeg: false },
      { id: "5-3", name: "Veggie Burger", description: "Plant-based patty with avocado and grilled veggies", price: 320, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300&h=200&fit=crop", category: "Burgers", isVeg: true },
      { id: "5-4", name: "Milkshake", description: "Thick and creamy vanilla or chocolate shake", price: 220, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop", category: "Drinks", isVeg: true },
      { id: "5-5", name: "Onion Rings", description: "Crispy battered onion rings with dipping sauce", price: 200, image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&h=200&fit=crop", category: "Sides", isVeg: true },
    ],
  },
  {
    id: "6",
    name: "Mediterranean Breeze",
    cuisine: "Mediterranean · Healthy · Bowls",
    rating: 4.4,
    reviewCount: 176,
    deliveryTime: "25-35 min",
    deliveryFee: 26,
    minOrder: 200,
    image: "https://images.unsplash.com/photo-1540914124281-342587941389?w=600&h=400&fit=crop",
    address: "888 Olive Street",
    isOpen: false,
    tags: ["Healthy"],
    menu: [
      { id: "6-1", name: "Falafel Bowl", description: "Crispy falafel with hummus, tabbouleh, and tahini", price: 360, image: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=300&h=200&fit=crop", category: "Bowls", isVeg: true, isPopular: true },
      { id: "6-2", name: "Chicken Shawarma Wrap", description: "Spiced chicken with garlic sauce in warm pita", price: 340, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&h=200&fit=crop", category: "Wraps", isVeg: false },
      { id: "6-3", name: "Greek Salad", description: "Fresh vegetables with feta cheese and olives", price: 290, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop", category: "Salads", isVeg: true },
      { id: "6-4", name: "Baklava", description: "Flaky pastry with nuts and honey syrup", price: 240, image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=300&h=200&fit=crop", category: "Desserts", isVeg: true },
    ],
  },
];
