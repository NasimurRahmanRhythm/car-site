-- Car Showroom — Seed Data
-- Run after schema.sql and policies.sql.

insert into public.admin_members (email, name)
values ('rhythm4538@gmail.com', 'Admin')
on conflict (email) do nothing;

-- Demo inventory. Images are left empty (admin uploads real photos later);
-- CarCard/CarGallery render a placeholder when a car has no car_images rows.
insert into public.cars
  (slug, make, model, year, trim, price, currency, status, categories,
   mileage, exterior_color, interior_color, transmission, fuel_type,
   engine, horsepower, drivetrain, body_type, doors, seats, description,
   features, is_featured, sort_order)
values
  ('rolls-royce-wraith-2023', 'Rolls-Royce', 'Wraith', 2023, 'Black Badge',
   2199000, 'AED', 'available', array['showroom_stocks'],
   1200, 'Black', 'Tan', 'Automatic', 'Petrol',
   '6.6L V12 Twin-Turbo', 632, 'RWD', 'Coupe', 2, 4,
   'A commanding grand tourer finished in black over tan, presented in showroom-ready condition.',
   array['Starlight Headliner', 'Bespoke Audio', 'Night Vision', 'Panoramic Sunroof'],
   true, 1),

  ('ferrari-monza-sp2-2022', 'Ferrari', 'Monza SP2', 2022, null,
   14500000, 'AED', 'available', array['showroom_stocks', 'exchange_offers'],
   400, 'Rosso Corsa', 'Tan', 'Automatic', 'Petrol',
   '6.5L V12', 810, 'RWD', 'Speedster', 0, 2,
   'Limited-series Icona speedster, one of very few units allocated to the region.',
   array['Carbon Fiber Body', 'Titanium Exhaust', 'Bespoke Luggage Set'],
   true, 2),

  ('koenigsegg-regera-2021', 'Koenigsegg', 'Regera', 2021, null,
   16800000, 'AED', 'reserved', array['showroom_stocks'],
   850, 'Metallic Grey', 'Black', 'Direct Drive', 'Hybrid',
   '5.0L Twin-Turbo V8 + Electric', 1500, 'RWD', 'Coupe', 2, 2,
   'Hybrid hypercar with Koenigsegg Direct Drive — no gearbox, pure torque delivery.',
   array['Direct Drive System', 'Carbon Wheels', 'Front Axle Lift'],
   true, 3),

  ('bentley-continental-gt-2024', 'Bentley', 'Continental GT', 2024, 'Speed',
   1150000, 'AED', 'available', array['port_units', 'upcoming_units'],
   50, 'British Racing Green', 'Beige', 'Automatic', 'Petrol',
   '6.0L W12', 650, 'AWD', 'Coupe', 2, 4,
   'Freshly landed unit, still being prepared for showroom display.',
   array['Rotating Display', 'Naim Audio', 'Mulliner Driving Specification'],
   false, 4),

  ('lamborghini-revuelto-2024', 'Lamborghini', 'Revuelto', 2024, null,
   3200000, 'AED', 'available', array['pre_orders', 'upcoming_units'],
   0, 'Verde Citymayan', 'Black', 'Automatic', 'Hybrid',
   '6.5L V12 + Tri-Motor Hybrid', 1015, 'AWD', 'Coupe', 2, 2,
   'Factory pre-order slot — configure specification with our sales team.',
   array['Hybrid V12', 'Carbon Monocoque', 'Adaptive Suspension'],
   false, 5),

  ('mclaren-750s-2023', 'McLaren', '750S', 2023, null,
   1450000, 'AED', 'available', array['showroom_stocks'],
   1800, 'Papaya Orange', 'Black', 'Automatic', 'Petrol',
   '4.0L Twin-Turbo V8', 740, 'RWD', 'Coupe', 2, 2,
   'Track-focused supercar with class-leading power-to-weight ratio.',
   array['Track Telemetry', 'Carbon Racing Seats', 'Lift System'],
   false, 6),

  ('porsche-911-turbo-s-2022', 'Porsche', '911 Turbo S', 2022, null,
   890000, 'AED', 'sold', array['exchange_offers'],
   6200, 'GT Silver', 'Red', 'Automatic', 'Petrol',
   '3.7L Twin-Turbo Flat-6', 640, 'AWD', 'Coupe', 2, 4,
   'Taken in as part of an exchange — sold to a returning client.',
   array['Sport Chrono Package', 'Carbon Ceramic Brakes'],
   false, 7),

  ('mercedes-g63-amg-2024', 'Mercedes-Benz', 'G63 AMG', 2024, null,
   980000, 'AED', 'available', array['showroom_stocks', 'port_units'],
   120, 'Obsidian Black', 'Black', 'Automatic', 'Petrol',
   '4.0L Twin-Turbo V8', 585, 'AWD', 'SUV', 5, 5,
   'Fresh off the boat and prepped, ready for immediate handover.',
   array['AMG Night Package', 'Burmester 4D Sound', 'Off-Road Package'],
   false, 8)

on conflict (slug) do nothing;
