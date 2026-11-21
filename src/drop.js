import * as THREE from 'three';

export const DROP = Object.freeze({ rideTime: 18, altitude: 78, descentSpeed: 8, steerSpeed: 16 });

export function busPositionAt(seconds) {
  const progress = Math.max(0, Math.min(1, seconds / DROP.rideTime));
  return { x: -45, y: DROP.altitude, z: 170 - progress * 340 };
}

export function findLandingSpot(x, z, canLand) {
  if (canLand(x, z)) return { x, z };
  for (let radius = 2; radius <= 40; radius += 2) {
    for (let i = 0; i < 24; i++) {
      const angle = i * Math.PI / 12;
      const px = x + Math.cos(angle) * radius, pz = z + Math.sin(angle) * radius;
      if (canLand(px, pz)) return { x: px, z: pz };
    }
  }
  return null;
}

export function approachClearLanding(x, z, dt, canLand) {
  const spot = findLandingSpot(x, z, canLand);
  if (!spot) return { x, z };
  const distance = Math.hypot(spot.x - x, spot.z - z);
  const fraction = distance > 0 ? Math.min(1, 22 * dt / distance) : 0;
  return { x: x + (spot.x - x) * fraction, z: z + (spot.z - z) * fraction };
}

export function createDropBus() {
  const bus = new THREE.Group();
  const blue = new THREE.MeshStandardMaterial({ color: '#2e809c', metalness: .35, roughness: .5 });
  const cream = new THREE.MeshStandardMaterial({ color: '#e4deb7', roughness: .7 });
  const dark = new THREE.MeshStandardMaterial({ color: '#243b43', roughness: .6 });
  const glass = new THREE.MeshStandardMaterial({ color: '#a4e0e1', metalness: .4, roughness: .2 });
  function box(w,h,d,material,x,y,z) {
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    m.position.set(x,y,z);m.castShadow=true;bus.add(m);return m;
  }
  box(3.8,2.7,9,blue,0,0,0);box(4, .3, 9.3,cream,0,1.5,0);
  box(3.8,1.15,1.8,blue,0,-.7,-5);box(3.4,1.3,.1,glass,0,.55,-4.56);
  box(4,.28,10.5,dark,0,-1.5,-.4);box(4.1,.3,.4,cream,0,-1.2,-6);
  for(const side of [-1,1]){
    for(let i=0;i<5;i++)box(.08,.95,1.12,glass,side*1.94,.45,3.4-i*1.5);
    box(.08,.12,8.7,cream,side*1.96,-.45,0);
    for(const z of [-3.3,3.1]){
      const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.45,12),dark);
      wheel.rotation.z=Math.PI/2;wheel.position.set(side*1.95,-1.45,z);bus.add(wheel);
    }
    for(const z of [-3,3])box(.08,5.4,.08,cream,side*1.5,4,z);
    box(.45,.32,.12,cream,side*1.2,-.65,-5.96);
  }
  const balloon=new THREE.Mesh(new THREE.SphereGeometry(5.5,20,12),blue);
  balloon.position.y=10;balloon.scale.set(1,1.25,1.3);bus.add(balloon);
  const band=new THREE.Mesh(new THREE.TorusGeometry(5.55,.15,6,32),cream);
  band.position.y=10;band.rotation.x=Math.PI/2;band.scale.y=1.3;bus.add(band);
  box(2,.3,2,dark,0,3.3,0);
  bus.visible=false;
  return bus;
}

export function createGlider() {
  const glider=new THREE.Group();
  const canopy=new THREE.Mesh(new THREE.SphereGeometry(2.6,16,8,0,Math.PI*2,0,Math.PI/2),
    new THREE.MeshStandardMaterial({color:'#dfff82',side:THREE.DoubleSide,roughness:.7}));
  canopy.scale.set(1,.35,.7);canopy.position.y=4.4;glider.add(canopy);
  const cordMaterial=new THREE.LineBasicMaterial({color:'#dce5d3'});
  for(const side of [-1,1])for(const z of [-1,1]){
    const geometry=new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(side*2.15,4.5,z*.85),new THREE.Vector3(side*.45,1.9,0),
    ]);
    glider.add(new THREE.Line(geometry,cordMaterial));
  }
  glider.visible=false;
  return glider;
}
