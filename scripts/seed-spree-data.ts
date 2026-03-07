// scripts/seed-spree-data.ts
// All Spree seed data — taxonomies, option types, properties, products, prototypes, menus, promotions

export const TAXONOMIES = [
  { name: "Shop" },
  { name: "Marketplace" },
  { name: "Collections" }
] as const;

export const TAXONS: Record<string, string[]> = {
  Shop: ["Devices", "Accessories", "Apparel"],
  Marketplace: ["Sample Packs", "Synths", "Visualizers"],
  Collections: ["Featured", "New Arrivals", "Pre-Order", "Bundles"]
};

export const OPTION_TYPES = [
  {
    name: "color",
    presentation: "Color",
    values: [
      { name: "black", presentation: "#000000" },
      { name: "white", presentation: "#ffffff" }
    ]
  },
  {
    name: "size",
    presentation: "Size",
    values: [
      { name: "s", presentation: "S" },
      { name: "m", presentation: "M" },
      { name: "l", presentation: "L" },
      { name: "xl", presentation: "XL" },
      { name: "xxl", presentation: "XXL" }
    ]
  }
] as const;

export const PROPERTIES = [
  { name: "shipping_type", presentation: "Shipping Type" },
  { name: "preorder", presentation: "Pre-Order" },
  { name: "ships_date", presentation: "Ships" },
  { name: "connectivity", presentation: "Connectivity" },
  { name: "compatibility", presentation: "Compatibility" },
  { name: "format", presentation: "Format" },
  { name: "file_count", presentation: "Files Included" },
  { name: "polyphony", presentation: "Polyphony" }
] as const;

export interface ProductDef {
  name: string;
  slug: string;
  price: string;
  description: string;
  shippingWeight?: string;
  optionType?: string;
  taxons: string[];
  properties: Record<string, string>;
  variants?: { optionValue: string; sku: string }[];
}

export const PRODUCTS: ProductDef[] = [
  {
    name: "Beeper \u03948",
    slug: "beeper-8",
    price: "199.99",
    description:
      "BLE MIDI controller with 8x FSR trigger pads, 2x capacitive-touch sliders, and an AMOLED heads-up display. PRE-ORDER NOW \u2014 SHIPS FALL 2026.",
    shippingWeight: "0.5",
    optionType: "color",
    taxons: ["Devices", "Featured", "Pre-Order"],
    properties: {
      shipping_type: "physical",
      preorder: "true",
      ships_date: "Fall 2026",
      connectivity: "BLE MIDI"
    },
    variants: [
      { optionValue: "black", sku: "BEEPER-D8-BLK" },
      { optionValue: "white", sku: "BEEPER-D8-WHT" }
    ]
  },
  {
    name: "Beeper Carrying Case",
    slug: "beeper-carrying-case",
    price: "29.99",
    description:
      "Custom-fit carrying case for the Beeper \u03948 controller. Padded interior with accessory pocket.",
    shippingWeight: "0.3",
    taxons: ["Accessories"],
    properties: { shipping_type: "physical" }
  },
  {
    name: "USB-C Cable",
    slug: "usb-c-cable",
    price: "14.99",
    description:
      "Premium braided USB-C cable for charging and firmware updates. 6ft / 1.8m.",
    shippingWeight: "0.1",
    taxons: ["Accessories"],
    properties: { shipping_type: "physical" }
  },
  {
    name: "Beeper T-Shirt",
    slug: "beeper-t-shirt",
    price: "34.99",
    description: "Beeper logo tee. 100% cotton, unisex fit.",
    shippingWeight: "0.2",
    optionType: "size",
    taxons: ["Apparel"],
    properties: { shipping_type: "physical" },
    variants: [
      { optionValue: "s", sku: "BEEPER-TEE-S" },
      { optionValue: "m", sku: "BEEPER-TEE-M" },
      { optionValue: "l", sku: "BEEPER-TEE-L" },
      { optionValue: "xl", sku: "BEEPER-TEE-XL" },
      { optionValue: "xxl", sku: "BEEPER-TEE-XXL" }
    ]
  },
  {
    name: "Beeper iOS App",
    slug: "beeper-ios-app",
    price: "4.99",
    description:
      "The Beeper companion app for iOS. Synths, samplers, visualizers, and direct BLE MIDI control.",
    taxons: ["Synths"],
    properties: { shipping_type: "digital", compatibility: "iOS 16+" }
  },
  {
    name: "Starter Sample Pack",
    slug: "starter-sample-pack",
    price: "9.99",
    description: "64 curated drum hits, loops, and one-shots. WAV + MIDI.",
    taxons: ["Sample Packs", "Featured"],
    properties: {
      shipping_type: "digital",
      compatibility: "iOS 16+",
      format: "WAV / MIDI",
      file_count: "64 samples"
    }
  },
  {
    name: "Analog Dreams Synth",
    slug: "analog-dreams-synth",
    price: "6.99",
    description:
      "Warm analog-modeled synth with 8-voice polyphony. Detune, filter, ADSR.",
    taxons: ["Synths"],
    properties: {
      shipping_type: "digital",
      compatibility: "iOS 16+",
      polyphony: "8 voices"
    }
  },
  {
    name: "Neon Grid Visualizer",
    slug: "neon-grid-visualizer",
    price: "3.99",
    description:
      "Retro-futuristic wireframe grid visualizer. Responds to MIDI velocity and frequency.",
    taxons: ["Visualizers"],
    properties: {
      shipping_type: "digital",
      compatibility: "iOS 16+"
    }
  }
];

// --- Prototypes ---
// Prototypes group option types, properties, and taxons for quick product creation in admin.
// Note: Spree 4.2 /api/v1/prototypes endpoint may not exist; these are seeded via rails runner.
export interface PrototypeDef {
  name: string;
  optionTypes: string[];
  properties: string[];
  taxons: string[];
}

export const PROTOTYPES: PrototypeDef[] = [
  {
    name: "Physical Device",
    optionTypes: ["color"],
    properties: ["shipping_type", "preorder", "ships_date", "connectivity"],
    taxons: ["Devices"]
  },
  {
    name: "Apparel",
    optionTypes: ["size"],
    properties: ["shipping_type"],
    taxons: ["Apparel"]
  },
  {
    name: "Accessory",
    optionTypes: [],
    properties: ["shipping_type"],
    taxons: ["Accessories"]
  },
  {
    name: "Digital Product",
    optionTypes: [],
    properties: [
      "shipping_type",
      "compatibility",
      "format",
      "file_count",
      "polyphony"
    ],
    taxons: ["Sample Packs", "Synths", "Visualizers"]
  }
];

// --- Menu Locations & Items ---
// Menu location 1 = Header nav (MainMenu), Menu location 2 = Footer columns.
// The custom Spree menu API is read-only; menus must be created via admin panel or rails runner.
export interface MenuItemDef {
  name: string;
  url: string;
  children?: MenuItemDef[];
}

export interface MenuLocationDef {
  title: string;
  location: string;
  items: MenuItemDef[];
}

export const MENU_LOCATIONS: MenuLocationDef[] = [
  {
    title: "Header Navigation",
    location: "header",
    items: [
      {
        name: "Shop",
        url: "/browse?mode=shop",
        children: [
          { name: "Devices", url: "/browse?mode=shop&category=Devices" },
          {
            name: "Accessories",
            url: "/browse?mode=shop&category=Accessories"
          },
          { name: "Apparel", url: "/browse?mode=shop&category=Apparel" }
        ]
      },
      {
        name: "Marketplace",
        url: "/browse?mode=marketplace",
        children: [
          {
            name: "Sample Packs",
            url: "/browse?mode=marketplace&category=Sample+Packs"
          },
          { name: "Synths", url: "/browse?mode=marketplace&category=Synths" },
          {
            name: "Visualizers",
            url: "/browse?mode=marketplace&category=Visualizers"
          }
        ]
      },
      { name: "Pre-Order", url: "/beeper-8" }
    ]
  },
  {
    title: "Footer Navigation",
    location: "footer",
    items: [
      {
        name: "Shop",
        url: "#",
        children: [
          { name: "All Products", url: "/browse" },
          { name: "Devices", url: "/browse?mode=shop&category=Devices" },
          {
            name: "Accessories",
            url: "/browse?mode=shop&category=Accessories"
          },
          { name: "Apparel", url: "/browse?mode=shop&category=Apparel" }
        ]
      },
      {
        name: "Marketplace",
        url: "#",
        children: [
          {
            name: "Sample Packs",
            url: "/browse?mode=marketplace&category=Sample+Packs"
          },
          { name: "Synths", url: "/browse?mode=marketplace&category=Synths" },
          {
            name: "Visualizers",
            url: "/browse?mode=marketplace&category=Visualizers"
          }
        ]
      },
      {
        name: "Support",
        url: "#",
        children: [
          { name: "Contact Us", url: "/contact" },
          { name: "Shipping & Returns", url: "/shipping" },
          { name: "FAQ", url: "/faq" }
        ]
      },
      {
        name: "Company",
        url: "#",
        children: [
          { name: "About", url: "/about" },
          { name: "Privacy Policy", url: "/privacy" },
          { name: "Terms & Conditions", url: "/terms" }
        ]
      }
    ]
  }
];

export const PROMOTIONS = [
  {
    name: "Pre-Order 10% Off",
    description: "10% off Beeper \u03948 pre-orders",
    code: "PREORDER10"
  },
  {
    name: "Bundle: Device + Case",
    description: "$10 off when you buy Beeper \u03948 + Carrying Case together",
    code: "BUNDLE10"
  },
  {
    name: "Launch Free Shipping",
    description: "Free shipping on orders over $150",
    code: "FREESHIP150"
  }
];
