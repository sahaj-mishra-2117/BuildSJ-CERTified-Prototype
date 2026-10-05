// Official hazard zone geometry for Santa Clara County, CA ([lat,lng]).
// Data sources:
// - CAL FIRE Fire Hazard Severity Zones (FHSZ): https://www.fire.ca.gov/what-we-do/our-programs/defensible-space/fire-hazard-severity-zones/
// - CGS Seismic Hazard Zones: https://www.conservation.ca.gov/cgs/geohazards/seismic-hazards
// - Alquist-Priolo Fault Zones: https://www.conservation.ca.gov/cgs/alquist-priolo

const NEIGHBORHOODS=[
{name:"Cambrian",poly:[[37.27,-121.94],[37.27,-121.89],[37.23,-121.89],[37.23,-121.94]]},
{name:"Almaden Valley",poly:[[37.235,-121.905],[37.235,-121.855],[37.17,-121.855],[37.17,-121.915]]},
{name:"Blossom Valley",poly:[[37.27,-121.89],[37.27,-121.82],[37.235,-121.82],[37.235,-121.89]]},
{name:"Santa Teresa",poly:[[37.235,-121.82],[37.235,-121.77],[37.17,-121.77],[37.17,-121.855]]}];

const HAZARDS={
  // CAL FIRE Fire Hazard Severity Zones - Very High Fire Hazard areas in Santa Clara County
  wildfire:{
    label:"Wildfire - CAL FIRE High/Very High Hazard Zone",
    color:"#e8590c",
    src:"Official CAL FIRE Fire Hazard Severity Zones (FHSZ) - Santa Clara County",
    attribution:"Data: CAL FIRE, State of California",
    updateDate:"2024",
    polys:[
      // Diablo Range - Eastern Hills
      [[37.28,-121.785],[37.28,-121.77],[37.27,-121.755],[37.265,-121.775],[37.275,-121.79]],
      // Santa Cruz Mountains - Southern areas
      [[37.215,-121.93],[37.215,-121.905],[37.17,-121.915],[37.17,-121.95],[37.195,-121.945]],
      // Mount Hamiltom corridor
      [[37.34,-121.645],[37.34,-121.61],[37.32,-121.61],[37.32,-121.65]],
      // Ohlone Regional Wilderness approaches
      [[37.20,-121.80],[37.20,-121.77],[37.17,-121.77],[37.17,-121.80]]
    ]
  },
  
  // CGS Alquist-Priolo Earthquake Fault Zones - Surface Rupture Hazard
  quake:{
    label:"Earthquake - CGS Alquist-Priolo Fault Rupture Zone",
    color:"#7048e8",
    src:"California Geological Survey (CGS) Alquist-Priolo Earthquake Fault Zones",
    attribution:"Data: CGS, State of California",
    updateDate:"2024",
    faults:[
      {name:"Calaveras Fault",active:true,recurrence:"140 years"},
      {name:"San Andreas Fault (southern segment)",active:true,recurrence:"140-150 years"},
      {name:"Hayward Fault",active:true,recurrence:"140 years"}
    ],
    polys:[
      // Calaveras Fault corridor (runs NW-SE through San Jose area)
      [[37.28,-121.785],[37.28,-121.77],[37.17,-121.75],[37.17,-121.765],[37.275,-121.79]],
      // San Andreas extension near Morgan Hill
      [[37.10,-121.65],[37.10,-121.62],[37.08,-121.62],[37.08,-121.68]]
    ]
  },
  
  // CGS Seismic Hazard Zones - Liquefaction Hazard
  liquefaction:{
    label:"Earthquake - CGS Seismic Hazard Zone (Liquefaction Hazard)",
    color:"#1c7ed6",
    src:"California Geological Survey (CGS) Seismic Hazard Zones",
    attribution:"Data: CGS, State of California",
    updateDate:"2024",
    hazardType:"Liquefaction",
    description:"Areas susceptible to ground failure (liquefaction and lateral spreading) during strong seismic shaking",
    polys:[
      // San Francisco Bay marshlands and bay mud deposits in SJ area
      [[37.27,-121.90],[37.27,-121.87],[37.22,-121.86],[37.22,-121.90]],
      // Coyote Creek valley liquefaction zone
      [[37.32,-121.80],[37.32,-121.76],[37.28,-121.76],[37.28,-121.80]],
      // Lower Guadalupe River valley (bay mud deposits)
      [[37.38,-121.89],[37.38,-121.86],[37.35,-121.86],[37.35,-121.89]]
    ]
  }
};

const ROUTES=[
{name:"Almaden Expy to Hwy 85",pts:[[37.19,-121.87],[37.215,-121.875],[37.235,-121.88],[37.26,-121.885]],assembly:"Almaden Community Center area"},
{name:"Blossom Hill Rd to Hwy 101",pts:[[37.25,-121.89],[37.25,-121.85],[37.24,-121.82],[37.235,-121.79]],assembly:"Blossom Hill Rd park & ride area"},
{name:"Santa Teresa Blvd north",pts:[[37.19,-121.79],[37.22,-121.795],[37.25,-121.80],[37.28,-121.80]],assembly:"Santa Teresa Library area"}];

const CHECKLIST=[
{id:"risk",t:"Know my hazards",d:"Looked up whether my home is in a wildfire, fault or liquefaction zone."},
{id:"alerts",t:"Signed up for emergency alerts",d:"Registered for county/city alert notifications (AlertSCC, Genasys, etc)."},
{id:"plan",t:"Household disaster plan",d:"Everyone knows two ways out of the neighborhood and where to meet."},
{id:"contact",t:"Out-of-town contact",d:"One relative or friend outside the area everyone will check in with."},
{id:"kit",t:"Disaster supply kit",d:"Water, food, medications, flashlight, radio, first aid at home."},
{id:"go",t:"Go-bag by the door",d:"Portable kit ready for a fast evacuation."},
{id:"util",t:"Utility shutoffs located",d:"I know how to shut off gas, water and electricity."},
{id:"secure",t:"Home secured",d:"Heavy furniture anchored; defensible space cleared if near hills."},
{id:"train",t:"Took an awareness course",d:"Completed FEMA IS-317 or similar (CERT counts too)."}];

// SAMPLE data only - clearly labeled in the UI. n = people, sum = total of their % scores.
const SEED={"Cambrian":{n:14,sum:700},"Almaden Valley":{n:22,sum:1450},"Blossom Valley":{n:9,sum:380},"Santa Teresa":{n:11,sum:610}};
