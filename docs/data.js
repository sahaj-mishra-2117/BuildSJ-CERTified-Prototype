// ILLUSTRATIVE geometry for the prototype ([lat,lng]). Replace with official GeoJSON:
// CAL FIRE FHSZ, CGS seismic hazard zones, County/Genasys evacuation zones (see README).
const NEIGHBORHOODS=[
{name:"Cambrian",poly:[[37.27,-121.94],[37.27,-121.89],[37.23,-121.89],[37.23,-121.94]]},
{name:"Almaden Valley",poly:[[37.235,-121.905],[37.235,-121.855],[37.17,-121.855],[37.17,-121.915]]},
{name:"Blossom Valley",poly:[[37.27,-121.89],[37.27,-121.82],[37.235,-121.82],[37.235,-121.89]]},
{name:"Santa Teresa",poly:[[37.235,-121.82],[37.235,-121.77],[37.17,-121.77],[37.17,-121.855]]}];
const HAZARDS={
wildfire:{label:"Wildfire - High hazard zone",color:"#e8590c",src:"Modeled on CAL FIRE FHSZ",
 polys:[[[37.235,-121.93],[37.235,-121.905],[37.17,-121.915],[37.17,-121.95]],[[37.20,-121.80],[37.20,-121.77],[37.17,-121.77],[37.17,-121.80]]]},
quake:{label:"Earthquake - Fault rupture zone",color:"#7048e8",src:"Modeled on CGS Alquist-Priolo zones",
 polys:[[[37.28,-121.785],[37.28,-121.77],[37.17,-121.75],[37.17,-121.765]]]},
liquefaction:{label:"Earthquake - Liquefaction zone",color:"#1c7ed6",src:"Modeled on CGS Seismic Hazard Zones",
 polys:[[[37.27,-121.90],[37.27,-121.87],[37.22,-121.86],[37.22,-121.885]]]}};
const ROUTES=[
{name:"Almaden Expy to Hwy 85",pts:[[37.19,-121.87],[37.215,-121.875],[37.235,-121.88],[37.26,-121.885]],assembly:"Almaden Community Center area"},
{name:"Blossom Hill Rd to Hwy 101",pts:[[37.25,-121.89],[37.25,-121.85],[37.24,-121.82],[37.235,-121.79]],assembly:"Blossom Hill Rd park & ride area"},
{name:"Santa Teresa Blvd north",pts:[[37.19,-121.79],[37.22,-121.795],[37.25,-121.80],[37.28,-121.80]],assembly:"Santa Teresa Library area"}];
const CHECKLIST=[
{id:"risk",t:"Know my hazards",d:"Looked up whether my home is in a wildfire, fault or liquefaction zone."},
{id:"alerts",t:"Signed up for emergency alerts",d:"Registered for county/city alert notifications."},
{id:"plan",t:"Household disaster plan",d:"Everyone knows two ways out of the neighborhood and where to meet."},
{id:"contact",t:"Out-of-town contact",d:"One relative or friend outside the area everyone will check in with."},
{id:"kit",t:"Disaster supply kit",d:"Water, food, medications, flashlight, radio, first aid at home."},
{id:"go",t:"Go-bag by the door",d:"Portable kit ready for a fast evacuation."},
{id:"util",t:"Utility shutoffs located",d:"I know how to shut off gas, water and electricity."},
{id:"secure",t:"Home secured",d:"Heavy furniture anchored; defensible space cleared if near hills."},
{id:"train",t:"Took an awareness course",d:"Completed FEMA IS-317 or similar (CERT counts too)."}];
// SAMPLE data only - clearly labeled in the UI. n = people, sum = total of their % scores.
const SEED={"Cambrian":{n:14,sum:700},"Almaden Valley":{n:22,sum:1450},"Blossom Valley":{n:9,sum:380},"Santa Teresa":{n:11,sum:610}};
