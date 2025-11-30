-- Sample furniture products for testing
-- Run this in Supabase SQL Editor after running the main migration

-- Modern Gray Sofa
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images, video_url) VALUES
(
  'Modern Gray Sectional Sofa',
  'Beautiful L-shaped sectional sofa in excellent condition. Features comfortable cushions and durable fabric. Perfect for living rooms. Smoke-free and pet-free home.',
  450.00,
  'A+',
  '84"W x 36"D x 32"H',
  'Sofas',
  1,
  75.00,
  'Los Angeles, CA',
  ARRAY[
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80'
  ],
  'https://www.youtube.com/embed/dQw4w9WgXcQ'
);

-- Wooden Coffee Table
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images) VALUES
(
  'Rustic Wood Coffee Table',
  'Solid wood coffee table with natural finish. Great for farmhouse or rustic style homes. Minor scratches consistent with age, adds character. Very sturdy construction.',
  180.00,
  'A',
  '48"W x 24"D x 18"H',
  'Tables',
  1,
  40.00,
  'Austin, TX',
  ARRAY[
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80',
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80',
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80'
  ]
);

-- Leather Recliner
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images) VALUES
(
  'Brown Leather Recliner Chair',
  'Comfortable genuine leather recliner in brown. Power reclining feature works perfectly. Some wear on armrests but overall great condition. Very comfortable for reading or watching TV.',
  320.00,
  'B',
  '38"W x 40"D x 42"H',
  'Recliners',
  1,
  60.00,
  'Miami, FL',
  ARRAY[
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80',
    'https://images.unsplash.com/photo-1560185127-6d2e3b14b1e0?w=800&q=80'
  ]
);

-- Dining Table Set
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images, video_url) VALUES
(
  'Oak Dining Table with 6 Chairs',
  'Beautiful solid oak dining set. Table extends from 6-seater to 8-seater. Chairs have cushioned seats. Perfect for family dinners. Excellent condition, barely used.',
  650.00,
  'A+',
  '72"L x 42"W x 30"H (extends to 96"L)',
  'Tables',
  1,
  95.00,
  'Chicago, IL',
  ARRAY[
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
    'https://images.unsplash.com/photo-1594657583933-97fca7fec9e7?w=800&q=80'
  ],
  'https://www.youtube.com/embed/jNQXAC9IVRw'
);

-- Bookshelf
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images) VALUES
(
  'White 5-Shelf Bookcase',
  'Clean, modern white bookshelf. Five adjustable shelves. Perfect for books, decor, or storage. Some minor scuffs on bottom shelf. Solid and stable.',
  120.00,
  'A',
  '36"W x 12"D x 72"H',
  'Storage',
  2,
  35.00,
  'Seattle, WA',
  ARRAY[
    'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80'
  ]
);

-- Outdoor Patio Set
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images, video_url) VALUES
(
  'Outdoor Wicker Patio Furniture Set',
  '4-piece patio set: 2 chairs, loveseat, and coffee table. Weather-resistant wicker with comfortable cushions. Cushion covers are removable and washable. Perfect for porch or deck.',
  380.00,
  'A',
  'Loveseat: 52"W x 30"D x 34"H',
  'Outdoor',
  1,
  80.00,
  'Phoenix, AZ',
  ARRAY[
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800&q=80',
    'https://images.unsplash.com/photo-1600494448655-24fbe8b84e08?w=800&q=80',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80'
  ],
  'https://www.youtube.com/embed/dQw4w9WgXcQ'
);

-- Dresser
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images) VALUES
(
  'Mid-Century Modern Dresser',
  'Stylish 6-drawer dresser with original brass handles. Beautiful wood grain. All drawers slide smoothly. Great for bedroom or entryway. Vintage piece in excellent shape.',
  290.00,
  'A+',
  '48"W x 20"D x 34"H',
  'Dressers',
  1,
  55.00,
  'Portland, OR',
  ARRAY[
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
    'https://images.unsplash.com/photo-1600120158275-c4fd0b92a275?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80'
  ]
);

-- Office Chair
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images) VALUES
(
  'Ergonomic Office Desk Chair',
  'Black mesh office chair with lumbar support and adjustable height. Very comfortable for long work sessions. Used for 1 year in home office. Like new condition.',
  145.00,
  'A+',
  '26"W x 26"D x 38-42"H',
  'Chairs',
  1,
  30.00,
  'New York, NY',
  ARRAY[
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80',
    'https://images.unsplash.com/photo-1589384267710-c011a1a3ed0e?w=800&q=80',
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80'
  ]
);

-- Bed Frame
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images) VALUES
(
  'Queen Platform Bed Frame',
  'Modern low-profile platform bed frame. No box spring needed. Solid wood construction with gray fabric upholstery. Includes adjustable headboard. Very sturdy and stylish.',
  420.00,
  'A',
  '64"W x 84"L x 48"H',
  'Beds',
  1,
  90.00,
  'Denver, CO',
  ARRAY[
    'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    'https://images.unsplash.com/photo-1578898886596-29b59e4b5293?w=800&q=80',
    'https://images.unsplash.com/photo-1560185009-dddeb820c7b7?w=800&q=80'
  ]
);

-- TV Stand
INSERT INTO products (title, description, price, condition, dimensions, category, stock, shipping_cost, pickup_location, images) VALUES
(
  'Modern Black TV Stand',
  'Sleek TV console with 2 cabinets and open shelf. Fits TVs up to 65 inches. Cable management holes in back. Modern design works with any decor. Excellent condition.',
  195.00,
  'A+',
  '60"W x 16"D x 24"H',
  'Storage',
  1,
  45.00,
  'Boston, MA',
  ARRAY[
    'https://images.unsplash.com/photo-1565183928294-7d22d5c4fcec?w=800&q=80',
    'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80',
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'
  ]
);
