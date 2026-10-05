// ILLUSTRATIVE geometry for the prototype ([lat,lng]). Replace with official GeoJSON:
// CAL FIRE FHSZ, CGS seismic hazard zones, County/Genasys evacuation zones.
const NEIGHBORHOODS = [
  { name: "Cambrian", poly: [[37.27, -121.94], [37.27, -121.89], [37.23, -121.89], [37.23, -121.94]] },
  { name: "Almaden Valley", poly: [[37.235, -121.905], [37.235, -121.855], [37.17, -121.855], [37.17, -121.915]] },
  { name: "Blossom Valley", poly: [[37.27, -121.89], [37.27, -121.82], [37.235, -121.82], [37.235, -121.89]] },
  { name: "Santa Teresa", poly: [[37.235, -121.82], [37.235, -121.77], [37.17, -121.77], [37.17, -121.855]] }
];

const HAZARDS = {
  wildfire: {
    label: "Wildfire - High hazard zone",
    color: "#e8590c",
    src: "Modeled on CAL FIRE FHSZ",
    attribution: "CAL FIRE",
    updateDate: "2024",
    polys: [
      [[37.235, -121.93], [37.235, -121.905], [37.17, -121.915], [37.17, -121.95]],
      [[37.20, -121.80], [37.20, -121.77], [37.17, -121.77], [37.17, -121.80]]
    ]
  },
  quake: {
    label: "Earthquake - Fault rupture zone",
    color: "#7048e8",
    src: "Modeled on CGS Alquist-Priolo zones",
    attribution: "CGS",
    updateDate: "2024",
    polys: [
      [[37.28, -121.785], [37.28, -121.77], [37.17, -121.75], [37.17, -121.765]]
    ]
  },
  liquefaction: {
    label: "Earthquake - Liquefaction zone",
    color: "#1c7ed6",
    src: "Modeled on CGS Seismic Hazard Zones",
    attribution: "CGS",
    updateDate: "2024",
    polys: [
      [[37.27, -121.90], [37.27, -121.87], [37.22, -121.86], [37.22, -121.885]]
    ]
  }
};

const ROUTES = [
  { name: "Almaden Expy to Hwy 85", pts: [[37.19, -121.87], [37.215, -121.875], [37.235, -121.88], [37.26, -121.885]], assembly: "Almaden Community Center area" },
  { name: "Blossom Hill Rd to Hwy 101", pts: [[37.25, -121.89], [37.25, -121.85], [37.24, -121.82], [37.235, -121.79]], assembly: "Blossom Hill Rd park & ride area" },
  { name: "Santa Teresa Blvd north", pts: [[37.19, -121.79], [37.22, -121.795], [37.25, -121.80], [37.28, -121.80]], assembly: "Santa Teresa Library area" }
];

const CHECKLIST = [
  {
    id: "risk-fire",
    category: "Know your hazards",
    title: "Check wildfire risk",
    desc: "I checked whether my home is in a wildfire risk area or evacuation zone."
  },
  {
    id: "risk-earthquake",
    category: "Know your hazards",
    title: "Check earthquake risk",
    desc: "I checked whether my home is near a fault or liquefaction zone."
  },
  {
    id: "risk-evac",
    category: "Know your hazards",
    title: "Know my evacuation area",
    desc: "I know which evacuation zone or routes apply to my home."
  },
  {
    id: "plan-routes",
    category: "Create disaster plans",
    title: "Create evacuation routes",
    desc: "I identified at least two ways to leave my neighborhood."
  },
  {
    id: "plan-meeting",
    category: "Create disaster plans",
    title: "Choose a meeting place",
    desc: "My household knows where to reunite if separated."
  },
  {
    id: "plan-contact",
    category: "Create disaster plans",
    title: "Set an out-of-town contact",
    desc: "Everyone has one person outside the area to check in with."
  },
  {
    id: "kit-water",
    category: "Build supply kits",
    title: "Store water",
    desc: "I have enough water for each household member and pet."
  },
  {
    id: "kit-food",
    category: "Build supply kits",
    title: "Store food",
    desc: "I have non-perishable food for at least several days."
  },
  {
    id: "kit-docs",
    category: "Build supply kits",
    title: "Protect important documents",
    desc: "I keep copies of IDs, insurance, and key records in a safe container."
  },
  {
    id: "kit-medical",
    category: "Build supply kits",
    title: "Prepare medical supplies",
    desc: "I have medications, first aid materials, and required medical items."
  },
  {
    id: "home-fire",
    category: "Reduce home hazards",
    title: "Reduce fire risk at home",
    desc: "I have checked for fire hazards like brush, dry vegetation, or unsafe appliances."
  },
  {
    id: "home-gas",
    category: "Reduce home hazards",
    title: "Know utility shut-offs",
    desc: "I know how to turn off gas, water, and electricity in an emergency."
  },
  {
    id: "home-secure",
    category: "Reduce home hazards",
    title: "Secure furniture and supplies",
    desc: "I have secured heavy furniture and made my home safer during shaking."
  },
  {
    id: "alert-signup",
    category: "Stay informed",
    title: "Sign up for alerts",
    desc: "I am signed up for local emergency alerts and notifications."
  },
  {
    id: "alert-training",
    category: "Stay informed",
    title: "Take emergency training",
    desc: "I have reviewed a preparedness guide or completed local emergency training."
  }
];

const SEED = {
  Cambrian: { n: 14, sum: 700 },
  "Almaden Valley": { n: 22, sum: 1450 },
  "Blossom Valley": { n: 9, sum: 380 },
  "Santa Teresa": { n: 11, sum: 610 }
};
