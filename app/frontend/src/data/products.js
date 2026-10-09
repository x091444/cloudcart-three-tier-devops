const products = [
  {
    id: 1,
    name: "CloudBook Pro 14",
    category: "Laptops",
    price: 74999,
    oldPrice: 84999,
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    description:
      "A powerful 14-inch laptop designed for productivity, development, and everyday performance. Featuring a high-resolution display, fast SSD storage, and a premium lightweight design.",
    features: [
      "14-inch Full HD display",
      "16GB RAM",
      "512GB SSD",
      "Backlit keyboard",
      "Wi-Fi 6",
    ],
  },
  {
    id: 2,
    name: "CloudPhone X1",
    category: "Smartphones",
    price: 42999,
    oldPrice: 47999,
    rating: 4.7,
    reviews: 98,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    description:
      "A modern smartphone combining a vibrant display, powerful performance, advanced cameras, and all-day battery life.",
    features: [
      "6.7-inch AMOLED display",
      "256GB storage",
      "50MP main camera",
      "Fast charging",
      "5G connectivity",
    ],
  },
  {
    id: 3,
    name: "CloudBuds Pro",
    category: "Audio",
    price: 6999,
    oldPrice: 8999,
    rating: 4.6,
    reviews: 215,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    description:
      "Premium wireless earbuds with active noise cancellation, immersive sound, and a compact charging case.",
    features: [
      "Active noise cancellation",
      "Up to 30 hours battery",
      "Touch controls",
      "Water resistant",
      "USB-C charging",
    ],
  },
  {
    id: 4,
    name: "DevPro Mechanical Keyboard",
    category: "Accessories",
    price: 4999,
    oldPrice: 5999,
    rating: 4.9,
    reviews: 176,
    badge: "Top Rated",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    description:
      "A premium mechanical keyboard built for developers, creators, and gamers who want responsive and comfortable typing.",
    features: [
      "Mechanical switches",
      "RGB backlighting",
      "USB-C connection",
      "Compact layout",
      "Programmable keys",
    ],
  },
  {
    id: 5,
    name: "UltraView 27 Monitor",
    category: "Monitors",
    price: 21999,
    oldPrice: 24999,
    rating: 4.7,
    reviews: 87,
    badge: "Deal",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    description:
      "A sharp 27-inch monitor with an immersive display designed for development, creative work, entertainment, and gaming.",
    features: [
      "27-inch display",
      "Full HD resolution",
      "75Hz refresh rate",
      "Low blue light mode",
      "HDMI and DisplayPort",
    ],
  },
  {
    id: 6,
    name: "CloudMouse Wireless",
    category: "Accessories",
    price: 1999,
    oldPrice: 2499,
    rating: 4.5,
    reviews: 143,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
    description:
      "An ergonomic wireless mouse with precise tracking and a comfortable shape for long working sessions.",
    features: [
      "Wireless connectivity",
      "Ergonomic design",
      "Adjustable DPI",
      "Long battery life",
      "Silent buttons",
    ],
  },
  {
    id: 7,
    name: "GameCore Controller",
    category: "Gaming",
    price: 3499,
    oldPrice: 3999,
    rating: 4.6,
    reviews: 74,
    badge: "Gaming",
    image:
      "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80",
    description:
      "A responsive wireless controller with precision controls and ergonomic grips for immersive gaming sessions.",
    features: [
      "Wireless connectivity",
      "Dual vibration",
      "Ergonomic grips",
      "USB-C charging",
      "Multi-platform support",
    ],
  },
  {
    id: 8,
    name: "PowerHub 100W",
    category: "Accessories",
    price: 2999,
    oldPrice: 3499,
    rating: 4.7,
    reviews: 61,
    badge: "Fast Charge",
    image:
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
    description:
      "A compact high-output charging hub designed to power laptops, phones, tablets, and other USB-C devices.",
    features: [
      "100W USB-C output",
      "Multiple ports",
      "Overheat protection",
      "Compact design",
      "Universal compatibility",
    ],
  },
  {
    id: 9,
    name: "CloudTab 11",
    category: "Tablets",
    price: 28999,
    oldPrice: 31999,
    rating: 4.5,
    reviews: 52,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
    description:
      "A versatile 11-inch tablet built for entertainment, studying, browsing, and everyday productivity.",
    features: [
      "11-inch display",
      "128GB storage",
      "8GB RAM",
      "All-day battery",
      "USB-C",
    ],
  },
  {
    id: 10,
    name: "StudioSound Headphones",
    category: "Audio",
    price: 8999,
    oldPrice: 10999,
    rating: 4.8,
    reviews: 109,
    badge: "Editor's Pick",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description:
      "Over-ear wireless headphones delivering detailed sound, deep bass, and comfortable listening for long sessions.",
    features: [
      "Active noise cancellation",
      "40-hour battery",
      "Bluetooth 5.3",
      "Comfort ear cushions",
      "Built-in microphone",
    ],
  },
  {
    id: 11,
    name: "StreamCam Full HD",
    category: "Accessories",
    price: 5499,
    oldPrice: 6499,
    rating: 4.4,
    reviews: 68,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80",
    description:
      "A Full HD webcam designed for meetings, online classes, streaming, and content creation.",
    features: [
      "1080p Full HD",
      "Auto light correction",
      "Built-in microphone",
      "Universal mount",
      "USB connection",
    ],
  },
  {
    id: 12,
    name: "DevStation Mini",
    category: "Computers",
    price: 45999,
    oldPrice: 49999,
    rating: 4.8,
    reviews: 43,
    badge: "Developer Pick",
    image:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=80",
    description:
      "A compact desktop workstation designed for development, productivity, virtualization, and everyday computing.",
    features: [
      "16GB RAM",
      "512GB NVMe SSD",
      "Wi-Fi 6",
      "Multiple USB ports",
      "Compact form factor",
    ],
  },
];

export default products;