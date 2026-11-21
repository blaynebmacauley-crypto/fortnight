import * as THREE from 'three';

// Game balance values; each weapon keeps its own magazine and reserve ammo.
export const WEAPONS = [
  { id: 'm4', name: 'M4A1 CARBINE', label: 'M4A1', capacity: 30, reserve: 180,
    interval: .1, reload: 1.8, damage: 25, range: 110, pellets: 1,
    spread: .009, aimSpread: .0025, recoil: .07, frequency: 125, preferredRange: 23 },
  { id: 'ak', name: 'AK-47', label: 'AK-47', capacity: 30, reserve: 150,
    interval: .15, reload: 2.2, damage: 34, range: 100, pellets: 1,
    spread: .014, aimSpread: .004, recoil: .11, frequency: 90, preferredRange: 20 },
  { id: 'pump', name: 'PUMP SHOTGUN', label: 'PUMP', capacity: 6, reserve: 36,
    interval: .85, reload: 2.5, damage: 14, range: 35, pellets: 8,
    spread: .065, aimSpread: .045, recoil: .22, frequency: 65, preferredRange: 10 },
];

const steel = new THREE.MeshStandardMaterial({ color: '#343b40', metalness: .75, roughness: .4 });
const dark = new THREE.MeshStandardMaterial({ color: '#192227', metalness: .3, roughness: .65 });
const wood = new THREE.MeshStandardMaterial({ color: '#9a5830', roughness: .72 });
const rubber = new THREE.MeshStandardMaterial({ color: '#161c1e', roughness: .9 });
const brass = new THREE.MeshStandardMaterial({ color: '#c8a65a', metalness: .65, roughness: .35 });

/** Original game models with a recognizable receiver, stock, grip, sights and barrel. */
export function createWeaponModel(index) {
  const spec = WEAPONS[index];
  const model = new THREE.Group();
  model.name = spec.name;
  function part(w, h, d, material, x, y, z, rotation = 0) {
    const object = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    object.position.set(x, y, z);
    object.rotation.x = rotation;
    object.castShadow = true;
    model.add(object);
    return object;
  }
  function tube(radius, length, material, x, y, z) {
    const object = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 12), material);
    object.rotation.x = Math.PI / 2;
    object.position.set(x, y, z);
    object.castShadow = true;
    model.add(object);
    return object;
  }

  // Receiver, pistol grip, trigger and guard are common to the three silhouettes.
  part(.16, .18, .42, steel, 0, 0, 0);
  part(.11, .25, .13, spec.id === 'ak' ? wood : rubber, 0, -.19, .09, -.28);
  part(.025, .1, .025, steel, 0, -.13, -.045, -.25);
  part(.1, .025, .15, steel, 0, -.2, -.03);
  part(.1, .1, .025, steel, 0, -.16, -.11);
  part(.19, .035, .35, dark, 0, .11, 0);
  // Ejection port and charging handle on the right side.
  part(.012, .055, .12, rubber, .086, .02, -.02);
  part(.09, .025, .025, steel, .105, .06, .06);

  let tip;
  let pump;
  if (spec.id === 'm4') {
    tube(.045, .32, steel, 0, .015, .33);
    part(.13, .22, .28, dark, 0, -.035, .46);
    part(.16, .28, .045, rubber, 0, -.04, .61);
    part(.17, .16, .4, dark, 0, 0, -.4);
    // Vents and accessory rails, rather than a solid rectangular gun shape.
    for (let i = 0; i < 5; i++) {
      part(.012, .045, .035, rubber, .089, .025, -.25 - i * .064);
      part(.012, .045, .035, rubber, -.089, .025, -.25 - i * .064);
      part(.2, .025, .025, steel, 0, .1, -.25 - i * .064);
    }
    tube(.028, .38, steel, 0, .015, -.77);
    tube(.043, .08, dark, 0, .015, -.99);
    part(.06, .14, .035, steel, 0, .105, -.86);
    part(.06, .12, .025, steel, 0, .17, .09);
    part(.12, .3, .17, dark, 0, -.23, -.16, -.12);
    tip = -1.04;
  } else if (spec.id === 'ak') {
    part(.14, .21, .37, wood, 0, -.02, .4, -.09);
    part(.16, .26, .035, rubber, 0, -.03, .59);
    part(.18, .16, .32, wood, 0, -.015, -.36);
    tube(.035, .52, steel, 0, .025, -.77);
    tube(.022, .3, steel, 0, .105, -.58);
    tube(.04, .07, dark, 0, .025, -1.055);
    part(.045, .15, .035, steel, 0, .1, -.92);
    part(.065, .08, .04, steel, 0, .15, .04);
    // Curved magazine built from a swept, extruded profile.
    const shape = new THREE.Shape();
    shape.moveTo(-.09, -.05);
    shape.lineTo(.08, -.05);
    shape.quadraticCurveTo(.1, -.3, -.02, -.48);
    shape.lineTo(-.2, -.42);
    shape.quadraticCurveTo(-.08, -.24, -.09, -.05);
    const magazine = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .12, bevelEnabled: false }), dark);
    magazine.rotation.y = Math.PI / 2;
    magazine.position.set(-.06, -.05, -.16);
    magazine.castShadow = true;
    model.add(magazine);
    tip = -1.1;
  } else {
    part(.15, .22, .42, wood, 0, -.035, .4, -.13);
    part(.17, .28, .035, rubber, 0, -.06, .62);
    tube(.043, .94, steel, 0, .035, -.68);
    tube(.037, .67, dark, 0, -.075, -.55);
    pump = part(.19, .17, .29, wood, 0, -.055, -.49);
    for (let i = 0; i < 6; i++) part(.195, .014, .018, dark, 0, -.125, -.37 - i * .045);
    part(.025, .045, .025, brass, 0, .1, -1.09);
    tip = -1.17;
  }

  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, .02, tip);
  model.add(muzzle);
  const flash = new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 0),
    new THREE.MeshBasicMaterial({ color: '#fff3b1' }));
  flash.scale.set(.7, .7, 2.6);
  flash.position.z = -.08;
  flash.visible = false;
  muzzle.add(flash);
  return { model, muzzle, flash, pump };
}
