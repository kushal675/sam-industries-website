/*
const P = (n,c,ck,img,hero)=>({name:n,category:c,categoryKey:ck,image:img,hero:hero||false});
const A='https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';
const B='https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=600&q=80';
const C='https://images.unsplash.com/photo-1581093804475-577d72e35325?auto=format&fit=crop&w=600&q=80';
const D='https://images.unsplash.com/photo-1581093458791-9d09c8d2f6cc?auto=format&fit=crop&w=600&q=80';
const E='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
const F='https://images.unsplash.com/photo-1581094651181-35942459ef62?auto=format&fit=crop&w=600&q=80';
window.__PRODUCT_CATALOG__ = [
  P('Brake Lever','Railway Components','railway',A,true),
  P('Precision Shaft','Precision Machining','precision',B,true),
  P('Spur Gear','Power Transmission','power',E,true),
  P('Flexible Coupling','Industrial Components','industrial',C,true),
  P('Fabricated Bracket','Fabrication','fabrication',D,true),
  P('End Cover','Industrial Components','industrial',F,true),
  P('Clevis Pin','Railway Components','railway',A,true),
  P('Bolted Assembly','Assemblies','fabrication',C,true),
  P('Adapter Plate','Fabrication','fabrication',D,true),
  P('Threaded Bush','Precision Machining','precision',B,true),
  P('Coupling Rod','Railway Components','railway',A),
  P('Cam Follower','Precision Machining','precision',B),
  P('Helical Gear','Power Transmission','power',E),
  P('Support Bracket','Fabrication','fabrication',D),
  P('Bearing Housing','Industrial Components','industrial',C),
  P('Hex Bolt Assembly','Railway Components','railway',A),
];
*/
const CATEGORIES = [
  { name: "Hero Products", key: "hero" },
  { name: "Vacuum Brake System", key: "vacuum-brake-system" },
  { name: "Critical Loco Valves", key: "critical-loco-valves" },
  { name: "Distributor Valves", key: "distributor-valves" },
  { name: "Air Brake Valves", key: "air-brake-valves" },
  { name: "Air Suspension Equipment", key: "air-suspension-equipment" },
  { name: "Brake Panels", key: "brake-panels" },
  { name: "Hopper Wagon Components", key: "hopper-wagon-components" },
  { name: "Electric Point Machines", key: "electric-point-machines" },
  { name: "Other Critical Items", key: "other-critical-items" },
];
const P = (n,c,ck,img,hero)=>({name:n,category:c,categoryKey:ck,image:img,hero:hero||false});

window.__PRODUCT_CATALOG__ = [

// ===== VACUUM BRAKE SYSTEM =====
P('Vacuum Brake Cylinder (VBA-05/M to VBA-25/M) Both E & F Type','Vacuum Brake System','vacuum-brake-system','images/products/vacuum-brake-cylinder.png',true),
P('Vacuum Hose Pipe with Clip (3/4", 2" & 2.5")','Vacuum Brake System','vacuum-brake-system','images/products/vacuum-hose-pipe-with-clip.png'),
P('Van Valve','Vacuum Brake System','vacuum-brake-system','images/products/van-valve.png'),
P('Vacuum Reservoir','Vacuum Brake System','vacuum-brake-system','images/products/vacuum-reservoir.png'),
P('Dummy Coupling','Vacuum Brake System','vacuum-brake-system','images/products/dummy-coupling.png',true),
P('Drain Cock','Vacuum Brake System','vacuum-brake-system','images/products/drain-cock-vacuum.png'),
P('Vacuum Gauge','Vacuum Brake System','vacuum-brake-system','images/products/vacuum-gauge.png'),
P('Syphon Tee','Vacuum Brake System','vacuum-brake-system','images/products/syphon-tee.png'),
P('Swan Neck','Vacuum Brake System','vacuum-brake-system','images/products/swan-neck.png'),
P('Release Valve Double Branch','Vacuum Brake System','vacuum-brake-system','images/products/release-valve-double-branch.png',true),
P('Release Valve Single Branch','Vacuum Brake System','vacuum-brake-system','images/products/release-valve-single-branch.png',true),
P('Hose Pipe Syphon','Vacuum Brake System','vacuum-brake-system','images/products/hose-pipe-syphon.png'),
P('Dummy Carrier','Vacuum Brake System','vacuum-brake-system','images/products/dummy-carrier.png'),
P('Universal Coupling','Vacuum Brake System','vacuum-brake-system','images/products/universal-coupling.png',true),

// ===== HOPPER WAGON COMPONENTS =====
P('Modified Door Hinge','Hopper Wagon Components','hopper-wagon-components','images/products/modified-door-hinge.png'),
P('Air Filter','Hopper Wagon Components','hopper-wagon-components','images/products/air-filter-hopper-wagon.png'),
P('Dom/Air Cylinder (12"/14")','Hopper Wagon Components','hopper-wagon-components','images/products/dom-air-cylinder.png',true),
P('Pneumatic Control Valve','Hopper Wagon Components','hopper-wagon-components','images/products/pneumatic-control-valve.png'),
P('Cylinder Rod Clevis Assembly','Hopper Wagon Components','hopper-wagon-components','images/products/cylinder-rod-clevis-assembly.png'),
P('Quick Coupling','Hopper Wagon Components','hopper-wagon-components','images/products/quick-coupling-hopper-wagon.png'),

// ===== AIR BRAKE VALVES =====
P('Dirt Collector','Air Brake Valves','air-brake-valves','images/products/dirt-collector.png'),
P('Angle Cock','Air Brake Valves','air-brake-valves','images/products/angle-cock.png'),
P('Check Valve','Air Brake Valves','air-brake-valves','images/products/check-valve.png'),
P('Isolating Cock','Air Brake Valves','air-brake-valves','images/products/isolating-cock.png'),

// ===== DISTRIBUTOR VALVES =====
P('Distributor Valve','Distributor Valves','distributor-valves','images/products/c3w-distributor-valve.png',true),
P('Automatic 2 Stage Distributor Valve','Distributor Valves','distributor-valves','images/products/c3w2-automatic-2-stage-dv.png',true),
P('Bracket for Distributor Valve','Distributor Valves','distributor-valves','images/products/bracket-for-distributor-valve.png'),
P('Common Pipe Bracket','Distributor Valves','distributor-valves','images/products/common-pipe-bracket.png'),
/*
// ===== BRAKE PANELS =====
P('IRAB-1','Brake Panels','brake-panels','images/products/irab-1-brake-panel.png'),
P('IRAB-9','Brake Panels','brake-panels','images/products/irab-9-brake-panel.png'),
*/
// ===== OTHER CRITICAL ITEMS =====

P('Brake Cylinder 12"','Other Critical Items','other-critical-items','images/products/brake-cylinder-12-inch.png',true),
P('Slack Adjuster DRV2A (450/600 Lg)','Other Critical Items','other-critical-items','images/products/slack-adjuster-drv2a.png',true),

P('Hose UIC Type','Other Critical Items','other-critical-items','images/products/hose-uic-type.png',true),
P('Angle Cock UIC Type','Other Critical Items','other-critical-items','images/products/uic-angle-cock.png',true),
P('Wiper Assembly','Other Critical Items','other-critical-items','images/products/wiper-assembly.png'),
P('Empty Load Device','Other Critical Items','other-critical-items','images/products/empty-load-device.png'),
P('Support Reservoir with Isolating Cock','Other Critical Items','other-critical-items','images/products/support-reservoir.png',true),
P('Load Sensing Device','Other Critical Items','other-critical-items','images/products/load-sensing-device.png'),
P('Pantograph','Other Critical Items','other-critical-items','images/products/pantograph.png'),
P('Lapping Cock','Other Critical Items','other-critical-items','images/products/lapping-cock.png'),
P('Rebar Coupler','Other Critical Items','other-critical-items','images/products/rebar-coupler.png'),
P('Single Wagon Test Rig','Other Critical Items','other-critical-items','images/products/single-wagon-test-rig.png'),
P('Magnet Valve','Other Critical Items','other-critical-items','images/products/magnet-valve.png'),

// ===== CRITICAL LOCO VALVES =====
P('N-1 Reducing Valve','Critical Loco Valves','critical-loco-valves','images/products/n-1-reducing-valve.png'),
P('E-1 Safety Valve','Critical Loco Valves','critical-loco-valves','images/products/e-1-safety-valve.png'),
P('24A Double Check Valve','Critical Loco Valves','critical-loco-valves','images/products/24a-double-check-valve.png'),
P('T-2 Safety Valve','Critical Loco Valves','critical-loco-valves','images/products/t-2-safety-valve.png'),
P('C-2W Relay Valve with 5mm/6mm Choke','Critical Loco Valves','critical-loco-valves','images/products/c-2w-relay-valve-5mm-choke.png'),
P('J-1 Safety Valve','Critical Loco Valves','critical-loco-valves','images/products/j-1-safety-valve.png'),
P('2 Way Horn Valve','Critical Loco Valves','critical-loco-valves','images/products/2-way-horn-valve.png'),
P('D-1 Emergency Brake Valve','Critical Loco Valves','critical-loco-valves','images/products/d-1-emergency-brake-valve.png'),
P('SA-9 Independent Brake Valve','Critical Loco Valves','critical-loco-valves','images/products/sa-9-independent-brake-valve.png'),
P('A-9 Auto Brake Valve','Critical Loco Valves','critical-loco-valves','images/products/a-9-auto-brake-valve.png',true),
P('MU-2B Valve','Critical Loco Valves','critical-loco-valves','images/products/mu-2b-valve.png'),

// ===== AIR SUSPENSION EQUIPMENT =====
P('Levelling Valve','Air Suspension Equipment','air-suspension-equipment','images/products/levelling-valve.png'),
P('Installation Lever','Air Suspension Equipment','air-suspension-equipment','images/products/installation-lever.png'),
P('Duplex Check Valve','Air Suspension Equipment','air-suspension-equipment','images/products/duplex-check-valve.png'),
P('Stainless Steel Reservoir (20 Ltrs. to 150 Ltrs.)','Air Suspension Equipment','air-suspension-equipment','images/products/stainless-steel-reservoir.png'),
P('Drain Valve','Air Suspension Equipment','air-suspension-equipment','images/products/drain-valve-air-suspension.png'),

// ===== ELECTRIC POINT MACHINES =====
P('Base Cast Iron (Unmachined)','Electric Point Machines','electric-point-machines','images/products/base-cast-iron-unmachined.png'),
P('Base Cast Iron (Machined)','Electric Point Machines','electric-point-machines','images/products/base-cast-iron-machined.png'),
P('Cast Iron Components (5 Items Set)','Electric Point Machines','electric-point-machines','images/products/cast-iron-components-5-item-set.png'),
P('Detector Rod','Electric Point Machines','electric-point-machines','images/products/detector-rod.png'),
P('Lock Rod','Electric Point Machines','electric-point-machines','images/products/lock-rod.png'),
P('Slide Cover','Electric Point Machines','electric-point-machines','images/products/slide-cover.png'),

];
