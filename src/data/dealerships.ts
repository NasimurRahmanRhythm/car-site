/**
 * The two dealerships VIP Motors was appointed to in 2026. Every figure below
 * is taken from the manufacturer/converter paperwork cited in each entry's
 * `source` line — the Skyworth NJL6126EV product sheet, and Kurtaran
 * Ambulans' TS EN 1789 equipment list plus its Mercedes-Benz VanPartner
 * certificate. Commercial terms (unit pricing, payment schedule, banking
 * details) are deliberately left out: they live in the proforma, not on a
 * public page.
 */

export interface DealershipImage {
  src: string;
  alt: string;
  /** Intrinsic size of the file — next/image needs it to reserve the space. */
  width: number;
  height: number;
}

export interface DealershipHighlights {
  title: string;
  items: readonly string[];
}

export interface Dealership {
  /** Doubles as the in-page anchor, so /dealerships#<slug> deep-links here. */
  slug: string;
  marque: string;
  /** Shown next to the marque where the brand also trades under a local name. */
  marqueNative?: string;
  segment: string;
  origin: string;
  /** ISO date for the <time datetime> attribute. */
  announcedOn: string;
  announcedLabel: string;
  headline: string;
  lede: string;
  paragraphs: readonly string[];
  hero: DealershipImage;
  specs: readonly { label: string; value: string }[];
  highlights: readonly DealershipHighlights[];
  gallery: readonly DealershipImage[];
  source: string;
}

export const DEALERSHIPS: readonly Dealership[] = [
  {
    slug: "skyworth-electric-buses",
    marque: "Skyworth Auto",
    marqueNative: "创维汽车",
    segment: "Pure Electric City Buses",
    origin: "Nanjing, China",
    announcedOn: "2026-09-01",
    announcedLabel: "September 2026",
    headline: "VIP Motors Appointed Skyworth Auto Bus Dealer",
    lede:
      "VIP Motors now represents Skyworth Auto's pure electric passenger vehicle range, opening with the NJL6126EV — a twelve-metre, two-step city bus built for trunk routes, BRT corridors and transport-hub feeder services in large and medium-sized cities.",
    paragraphs: [
      "The NJL6126EV is aimed squarely at the operators its maker calls its core customers: the urban public transport groups running high-frequency city services. An 11,990 mm monocoque body on a 6,100 mm wheelbase carries up to 95 passengers, with 35+1 seats as standard and seated layouts specified anywhere from 10 to 47 places.",
      "Drive comes from a permanent magnet synchronous motor rated at 110 or 120 kW and peaking at 200 or 240 kW, with 2,800 N·m of torque and energy-recovery braking. Chuangyuan or CATL packs from 229.6 to 350.2 kWh give a constant-speed range of 465 to 648 kilometres, putting a full day's duty cycle within reach of a single overnight charge.",
      "The bus rides on six-airbag air suspension and 275/70R22.5 tubeless radials, and everything from the five-in-one integrated controller to the remote monitoring terminal sits on one vehicle-wide CAN bus. Fire protection is built in at three levels — automatic extinguishing in both the battery and high-voltage compartments, plus two 4 kg dry-powder units in the saloon — alongside hill assist, AutoHold and a national-standard recorder covering the road ahead, the pedals and the driver.",
    ],
    hero: {
      src: "/images/dealerships/skyworth-bus-hero.jpg",
      alt: "A Skyworth NJL6126EV pure electric city bus in dark green and champagne livery, seen from the front three-quarter.",
      width: 1600,
      height: 900,
    },
    specs: [
      { label: "Model", value: "NJL6126EV Two-Step Series" },
      { label: "Dimensions (L × W × H)", value: "11,990 × 2,550 × 3,050 / 3,250 mm" },
      { label: "Wheelbase", value: "6,100 mm" },
      { label: "Passenger Capacity", value: "Up to 95 (10–47 seated)" },
      { label: "Standard Seats", value: "35 + 1" },
      { label: "Battery", value: "229.6 – 350.2 kWh (Chuangyuan / CATL)" },
      { label: "Range (Constant Speed)", value: "465 – 648 km" },
      { label: "Motor", value: "PMSM, 110 / 120 kW rated · 200 / 240 kW peak" },
      { label: "Maximum Torque", value: "2,800 N·m" },
      { label: "Top Speed", value: "69 km/h" },
      { label: "Gradeability", value: "≥ 18%" },
      { label: "Suspension", value: "Six-airbag air suspension" },
      { label: "Tyres", value: "275/70R22.5 tubeless radial" },
      { label: "Braking Distance (30 km/h, Full Load)", value: "≤ 9.5 m" },
      { label: "Turning Radius", value: "≤ 11 m" },
      { label: "Curb / Gross Mass", value: "11,700 – 12,650 kg / 18,000 kg" },
    ],
    highlights: [
      {
        title: "Driveline & Chassis",
        items: [
          "Five-in-one integrated controller with a Nanjing Jinlong vehicle control unit",
          "Self-cleaning ATS electronic motor cooling with an aluminium water tank",
          "7.5 t front axle and a maintenance-free 13 t rear axle, grease lubricated with a three-year warranty",
          "New-energy dedicated final drive and dual-source electric power steering pump",
          "Dual-circuit air brakes, front disc and rear drum, with energy-recovery braking",
          "Centralised chassis lubrication and aluminium alloy rims",
        ],
      },
      {
        title: "Safety & Monitoring",
        items: [
          "Automatic fire extinguishing in the battery and high-voltage compartments",
          "Two 4 kg dry-powder extinguishers in the saloon",
          "Eight anti-theft alarm safety hammers",
          "Hill assist (HAS) and AutoHold",
          "Driver, front-door and whole-bus CCTV with a separate reversing display",
          "New national-standard driving recorder and remote monitoring terminal",
        ],
      },
      {
        title: "Cabin & Passenger Comfort",
        items: [
          "32,000 kcal heating and cooling air conditioning with battery thermal management",
          "Panoramic aluminium alloy air ducts the length of the saloon",
          "Two roof escape hatches with ventilation fans",
          "IP67 high-voltage electric windscreen defroster",
          "LED front and rear destination signs, 16 dot matrix",
          "Laminated panoramic windscreen with built-in sliding side windows",
        ],
      },
      {
        title: "Available Options",
        items: [
          "ECAS electronically controlled air suspension",
          "Front and rear disc brakes with an electronic handbrake",
          "360° around-view, driver assistance and electronic rear-view mirrors",
          "Tyre-pressure monitoring",
          "Aluminium alloy body and all-aluminium fireproof low-voltage distribution",
          "Passenger flow statistics and intelligent IC card ticketing",
          "GPS automatic stop annunciator with an interior scrolling display",
        ],
      },
    ],
    gallery: [
      {
        src: "/images/dealerships/skyworth-bus-side.jpg",
        alt: "Side profile of the Skyworth NJL6126EV showing its front and centre passenger doors.",
        width: 1600,
        height: 1200,
      },
      {
        src: "/images/dealerships/skyworth-bus-front.jpg",
        alt: "Head-on view of the Skyworth NJL6126EV, with its LED destination sign and panoramic windscreen.",
        width: 1600,
        height: 1200,
      },
      {
        src: "/images/dealerships/skyworth-bus-cabin.jpg",
        alt: "Interior of the Skyworth NJL6126EV looking down the saloon, with yellow grab rails and stanchions.",
        width: 1600,
        height: 1068,
      },
    ],
    source:
      "Figures from the Skyworth NJL6126EV Two-Step Series product specification sheet.",
  },
  {
    slug: "mercedes-benz-sprinter-ambulance",
    marque: "Mercedes-Benz",
    segment: "Sprinter Emergency Ambulances",
    origin: "Bursa, Türkiye",
    announcedOn: "2026-08-26",
    announcedLabel: "August 2026",
    headline: "Mercedes-Benz Sprinter Emergency Ambulances Join the Roster",
    lede:
      "VIP Motors' second appointment covers Mercedes-Benz Sprinter emergency ambulances converted by Kurtaran Ambulans Dizayn, a certified Mercedes-Benz VanPartner in Bursa, Türkiye. The opening programme runs to 100 Sprinter 417 CDI units built to TS EN 1789.",
    paragraphs: [
      "Kurtaran Ambulans Dizayn San. ve Tic. A.Ş. holds a Mercedes-Benz VanPartner certificate valid from 18 March 2025 to 18 March 2027, issued in Stuttgart for individual body and conversion solutions. The certificate confirms the converter meets Mercedes-Benz's own requirements across quality, sales, technology and after-sales service — so each ambulance leaves the line as a factory-recognised conversion rather than an aftermarket rebuild.",
      "The base vehicle is the Sprinter 417 CDI: a 4x2 diesel van with a manual gearbox, converted at Ovaakça in Osmangazi, Bursa, and supplied from Türkiye. The opening programme covers 100 units.",
      "Inside, this is a full emergency unit rather than a patient transport van. The compartment is lined in one-piece fibreglass with TSE fire-resistance certified side panels and medicine cabinets, insulated in EVA elastomeric rubber, and finished in antibacterial epoxy over a waterproofed floor. Defibrillator and suction mounts are 10 G test certified, and the seating — an M1-class foldable doctor's chair and an M1-class swivel chair, both on three-point belts — carries seat sensors to TS EN 1789.",
    ],
    hero: {
      src: "/images/dealerships/mercedes-sprinter-vanpartner.jpg",
      alt: "A white Mercedes-Benz Sprinter panel van on the Mercedes-Benz VanPartner programme artwork.",
      width: 1600,
      height: 758,
    },
    specs: [
      { label: "Base Vehicle", value: "Mercedes-Benz Sprinter 417 CDI" },
      { label: "Drivetrain", value: "4x2, diesel, manual transmission" },
      { label: "Body Type", value: "Emergency ambulance to TS EN 1789" },
      { label: "Converter", value: "Kurtaran Ambulans Dizayn San. ve Tic. A.Ş." },
      { label: "Certification", value: "Mercedes-Benz VanPartner, 18.03.2025 – 18.03.2027" },
      { label: "Conversion Plant", value: "Osmangazi, Bursa" },
      { label: "Country of Origin", value: "Türkiye" },
      { label: "Opening Programme", value: "100 units" },
    ],
    highlights: [
      {
        title: "Stretcher & Immobilisation",
        items: [
          "Main stretcher with the new-model locking system and a non-slip rear ramp",
          "Combination chair stretcher, shovel stretcher and vacuum stretcher with pump",
          "Long plastic spinal board and transfer sheet",
          "K.E.D. rescue vest, three-piece neck brace set and head restraint",
          "Traction and inflatable splint sets, pelvic belt and tactical tourniquet",
          "Ceiling and stretcher IV stands with a 10 G certified infusion pump bracket",
        ],
      },
      {
        title: "Medical Equipment",
        items: [
          "Schiller DG4000 biphasic defibrillator",
          "Transport ventilator with a pressure-adjustable PEEP valve",
          "Injection pump and portable vacuum aspirator",
          "Finger pulse oximeter and non-contact thermometer",
          "Riester diagnostic set — otoscope, ophthalmoscope and rhinoscope",
          "Blood pressure monitors, blood glucose meter and a thermally insulated IV bag",
          "Emergency delivery kit, burn kit and adult intraosseous access kit",
        ],
      },
      {
        title: "Oxygen & Vacuum",
        items: [
          "Two fixed 10-litre oxygen cylinders with regulator and flowmeter",
          "Portable two-litre oxygen unit with its own flowmeter and masks",
          "Three-way and single oxygen outlets on a connection rail",
          "Vacuum jar, tubing and a Yankauer rigid suction set",
          "Adult and child oxygen masks and nasal cannulae",
        ],
      },
      {
        title: "Cabin, Electrical & Climate",
        items: [
          "Seven-inch full-touch colour electrical control panel",
          "2,000 W pure sine wave 12 V to 220 V inverter with battery charger and rectifier",
          "220 V shore power on a five-metre cable, interlocked so the vehicle cannot be driven while plugged in",
          "Ground fault protection and specially coded single-colour wiring to TS EN 1789",
          "LED interior, stretcher and step lighting",
          "Front and rear cabin air conditioning with a thermostat-controlled Webasto diesel heater",
          "Timed turbo ventilation, cab intercom and reverse alarm",
        ],
      },
      {
        title: "Warning & Livery",
        items: [
          "120 cm front and 50 cm rear power-LED lightbars",
          "100 W electronic siren and lightbar control",
          "Side square warning lights with area projectors",
          "Rear door and front dashboard LED modules",
          "ORAFOL reflective striping, lettering and logos with window frosting",
          "Glass breaker and belt cutter, fire extinguisher, sharps container and pedal bin",
        ],
      },
    ],
    gallery: [],
    source:
      "Details from Kurtaran Ambulans' TS EN 1789 equipment list (LST-01 rev. 10) and its Mercedes-Benz VanPartner certificate.",
  },
] as const;

export const DEALERSHIPS_PAGE = {
  eyebrow: "New Appointments",
  heading: "Two New Dealerships",
  intro:
    "VIP Motors has been appointed to two new franchises this year, both of them outside the showroom's usual grand-touring beat: Skyworth Auto's pure electric city buses out of Nanjing, and Mercedes-Benz Sprinter emergency ambulances converted in Bursa. Here is what each one brings.",
} as const;
