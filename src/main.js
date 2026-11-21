import * as THREE from 'three';
import { WEAPONS, createWeaponModel } from './weapons.js';
import { chooseTarget, spreadDirection } from './combat.js';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/barlow/800.css';
import '@fontsource/barlow-condensed/800.css';

const $ = id => document.getElementById(id);
const canvas = $('world');
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'}); }
catch { $('unsupported').classList.remove('hidden'); throw new Error('WebGL is unavailable'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a8d3c7');
scene.fog = new THREE.Fog('#b9d9c8', 90, 285);
const camera = new THREE.PerspectiveCamera(56, innerWidth/innerHeight,.15,450);
scene.add(new THREE.HemisphereLight('#def4ff','#697b39',2.3));
const sun = new THREE.DirectionalLight('#fff1bf',3.4);
sun.position.set(-55,95,35);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-100,right:100,top:100,bottom:-100,near:1,far:230});
sun.shadow.normalBias=.05;scene.add(sun);
const materials = new Map();
function mat(color, flat=true){const key=color+flat;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,flatShading:flat,roughness:.88}));return materials.get(key);}
function mesh(geo,color,parent=scene){const m=new THREE.Mesh(geo,typeof color==='string'?mat(color):color);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,color,x,y,z,parent=scene){const m=mesh(new THREE.BoxGeometry(w,h,d),color,parent);m.position.set(x,y,z);return m;}
function cone(r,h,color,x,y,z,parent=scene,n=7){const m=mesh(new THREE.ConeGeometry(r,h,n),color,parent);m.position.set(x,y,z);return m;}
function sphere(r,color,x,y,z,parent=scene){const m=mesh(new THREE.IcosahedronGeometry(r,1),color,parent);m.position.set(x,y,z);return m;}
let seed=731;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const groundY=(x,z)=>1.6*Math.sin(x*.042)*Math.cos(z*.037)+.65*Math.sin(z*.09)+.35*Math.cos(x*.11);
const terrainGeo=new THREE.PlaneGeometry(290,290,100,100);terrainGeo.rotateX(-Math.PI/2);
const pos=terrainGeo.attributes.position, colors=[];
const palette=['#7b9e4a','#8caa52','#739644','#91ac57','#79994b'];
for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),r=Math.hypot(x,z);pos.setY(i,groundY(x,z)-Math.max(0,r-116)*.55);const c=new THREE.Color(r>119?'#d0bc8a':palette[Math.floor(random()*palette.length)]);colors.push(c.r,c.g,c.b);}
terrainGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));terrainGeo.computeVertexNormals();
const terrain=mesh(terrainGeo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}));
const water=mesh(new THREE.PlaneGeometry(1800,1800),new THREE.MeshStandardMaterial({color:'#5fada6',roughness:.35,metalness:.15}));water.rotation.x=-Math.PI/2;water.position.y=-6;water.castShadow=false;
// A ribbon of worn stone leads through the settlement.
for(let z=-63;z<57;z+=3.3){for(let j=-1;j<=1;j++){const x=7+Math.sin(z*.025)*5+j*2.5;const tile=box(2.4,.12,3.15,['#b7ac89','#afa482','#c0b28d'][Math.floor(random()*3)],x,groundY(x,z)+.04,z);tile.rotation.y=(random()-.5)*.12;}}
const obstacles=[],decor=new THREE.Group();scene.add(decor);
function obstacle(x,z,w,d,h){obstacles.push({x,z,w,d,h,y:groundY(x,z)});}
function tree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,groundY(x,z),z);g.scale.setScalar(scale);decor.add(g);const trunk=mesh(new THREE.CylinderGeometry(.22,.5,3.6,6),'#766444',g);trunk.position.y=1.6;trunk.rotation.z=.06;sphere(2.45,'#587c3c',0,4.8,0,g);sphere(1.9,'#7b9a45',-1.3,5.3,.3,g);sphere(1.8,'#a0b352',.8,5.8,-.1,g);sphere(1.7,'#8ba64a',.9,4.7,1,g);obstacle(x,z,.8,.8,3);}
for(let i=0;i<115;i++){const x=(random()-.5)*235,z=(random()-.5)*235;if(Math.hypot(x,z)>114||Math.abs(x-7)<15||Math.hypot(x-24,z-12)<25||Math.hypot(x+24,z+24)<19)continue;tree(x,z,.65+random()*.85);}
function rock(x,z,s=1){const r=mesh(new THREE.DodecahedronGeometry(s,0),'#9da68c',decor);r.position.set(x,groundY(x,z)+s*.45,z);r.scale.set(1.3,.7,1);r.rotation.set(random(),random()*6,random());if(s>1.5)obstacle(x,z,s*2,s*1.6,s);}
for(let i=0;i<80;i++){let x=(random()-.5)*230,z=(random()-.5)*230;if(Math.abs(x-7)<8)continue;rock(x,z,.4+random()*2);}
function house(x,z,w,d,rotation=0){const g=new THREE.Group();g.position.set(x,groundY(x,z),z);g.rotation.y=rotation;decor.add(g);box(w,4.7,d,'#d5ccb0',0,2.2,0,g);box(w+.35,.25,d+.35,'#b8b19a',0,.1,0,g);
for(const dx of [-w/2+.12,w/2-.12])box(.2,4.7,d+.05,'#776d51',dx,2.2,0,g);
const roof=mesh(new THREE.CylinderGeometry(0,1,1,4),'#6f8583',g);roof.rotation.y=Math.PI/4;roof.scale.set(w*.85,3,d*.85);roof.position.y=5.9;
box(1.35,2.5,.15,'#4b6157',0,1.3,d/2+.1,g);box(1.6,.12,.45,'#a89c79',0,.15,d/2+.25,g);
for(const dx of [-w*.3,w*.3]){box(1.1,1.2,.12,'#516e70',dx,2.9,d/2+.1,g);box(1.3,.1,.25,'#f1dfb7',dx,2.2,d/2+.12,g);box(.07,1.2,.17,'#c9bd96',dx,2.9,d/2+.2,g);}
box(.8,2,.8,'#b6a282',w*.25,6.5,-d*.2,g);obstacle(x,z,rotation?d:w,rotation?w:d,6);
}
house(25,12,10,9,-.12);house(-10,-25,9,8,.08);house(28,-35,8,7,0);house(-22,21,10,8,.1);
// A ruined watchtower on the far ridge.
const tx=7,tz=-67,ty=groundY(tx,tz);
box(10,12,9,'#a6a991',tx,ty+5.5,tz,decor);obstacle(tx,tz,10,9,12);
for(let i=0;i<5;i++){box(1.2,1.8,1.2,'#b5b69c',tx-4.4+i*2.2,ty+12,tz+3.8,decor);box(1.2,1.8,1.2,'#b5b69c',tx-4.4+i*2.2,ty+12,tz-3.8,decor);}
box(1.4,2,.1,'#475c56',tx,ty+8,tz+4.55,decor);
for(let i=0;i<12;i++){let x=-5+i*2.6;box(2.5,1.2,.6,'#aaa58b',x,groundY(x,-50)+.6,-50,decor);}
for(const [x,z] of [[17,22],[20,23],[19,25],[-15,-19],[33,-29]]){box(1.8,1.6,1.8,'#b28d50',x,groundY(x,z)+.8,z,decor);box(1.9,.15,1.9,'#766344',x,groundY(x,z)+1.3,z,decor);obstacle(x,z,1.8,1.8,1.6);}
// Grass clusters, pale flowers, and distant clouds keep the island from feeling empty.
for(let i=0;i<470;i++){const x=(random()-.5)*230,z=(random()-.5)*230;if(Math.hypot(x,z)>115||Math.abs(x-7)<6)continue;cone(.18,.5,'#597e3b',x,groundY(x,z)+.2,z,decor,3);if(i%5===0)sphere(.12,'#e2d7a2',x,groundY(x,z)+.4,z,decor);}
const clouds=new THREE.Group();scene.add(clouds);
for(let i=0;i<22;i++){const g=new THREE.Group();g.position.set((random()-.5)*500,49+random()*25,(random()-.5)*500);for(let j=0;j<4;j++){const c=sphere(4+random()*5,'#e8ecdb',j*5,random()*2,random()*3,g);c.scale.y=.5;c.castShadow=false;}clouds.add(g);}
const actorGroup=new THREE.Group();scene.add(actorGroup);
function character(color,isPlayer=false){const root=new THREE.Group(),body=new THREE.Group();root.add(body);actorGroup.add(root);
box(.74,.95,.46,color,0,1.48,0,body);box(.58,.18,.49,'#384842',0,1.08,0,body);box(.66,.5,.23,'#2b4340',0,1.55,.31,body);
const head=sphere(.3,'#d9b78a',0,2.18,0,body);head.scale.set(.9,1.14,.9);sphere(.31,isPlayer?'#caac65':'#584f4c',0,2.32,-.02,body).scale.y=.55;
const legs=[];for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.21,1.05,0);body.add(leg);box(.29,.85,.32,'#384e49',0,-.43,0,leg);box(.31,.2,.5,'#263d3c',0,-.9,-.08,leg);legs.push(leg);}
const arms=[];for(const side of [-1,1]){const a=new THREE.Group();a.position.set(side*.48,1.83,0);body.add(a);box(.24,.5,.27,color,0,-.22,0,a);box(.2,.46,.22,'#cfad81',0,-.48,-.13,a);a.rotation.x=-.8;arms.push(a);}
const gun=new THREE.Group();gun.position.set(.52,1.7,-.36);body.add(gun);
return {root,body,legs,arms,gun,models:new Map(),health:100,phase:random()*6,alive:true,recoil:0,flashTime:0,target:null,targetTimer:0};}
function equipActor(actor,index){
  if(!actor.models.has(index))actor.models.set(index,createWeaponModel(index));
  for(const [slot,weapon] of actor.models){weapon.model.visible=slot===index;weapon.flash.visible=false;}
  const weapon=actor.models.get(index);
  if(!weapon.model.parent)actor.gun.add(weapon.model);
  actor.weaponIndex=index;actor.flash=weapon.flash;actor.muzzle=weapon.muzzle;actor.recoil=0;
}
const player=character('#697f65',true);player.root.position.set(0,groundY(0,28),28);
player.label='YOU';equipActor(player,0);
const BOT_SKILLS=[
  {name:'ROOKIE',spread:.15,pause:1.15,reaction:1.4,speed:.7},
  {name:'REGULAR',spread:.075,pause:.65,reaction:.85,speed:.85},
  {name:'VETERAN',spread:.04,pause:.3,reaction:.5,speed:1},
];
// Four rookies, three regulars and one veteran, spread around the island.
const BOT_ROSTER=[0,1,0,1,0,2,0,1];
const bots=[];const spawnPoints=[[-36,-27],[35,-8],[-39,26],[55,40],[-19,-57],[40,-62],[-65,-10],[12,65]];
for(let i=0;i<8;i++){const b=character(['#a46248','#7b688d','#8a8d4e','#577986'][i%4]);b.skill=BOT_SKILLS[BOT_ROSTER[i]];b.label=`${b.skill.name} ${i+1}`;equipActor(b,i%WEAPONS.length);b.shield=50;b.ammo=WEAPONS[b.weaponIndex].capacity;b.reloadTimer=0;b.root.position.set(spawnPoints[i][0],groundY(...spawnPoints[i]),spawnPoints[i][1]);b.cooldown=2+random()*4;bots.push(b);}
// One rookie and one regular hunt the player without needing to be provoked.
bots[1].huntTarget=player;bots[2].huntTarget=player;
const combatants=[player,...bots];
const stormMaterial=new THREE.MeshBasicMaterial({color:'#a273dc',transparent:true,opacity:.17,side:THREE.DoubleSide,depthWrite:false});
const storm=mesh(new THREE.CylinderGeometry(1,1,65,96,1,true),stormMaterial);storm.position.y=20;storm.castShadow=false;
const ring=mesh(new THREE.TorusGeometry(1,.012,4,128),new THREE.MeshBasicMaterial({color:'#c5a0ff'}));ring.rotation.x=-Math.PI/2;ring.position.y=2;
const pickups=[];for(const [x,z,type] of [[0,13,'ammo'],[18,28,'shield'],[-15,15,'ammo'],[20,-18,'med'],[-30,-35,'shield'],[45,20,'ammo'],[-45,-4,'med'],[2,-42,'ammo']]){const g=new THREE.Group();g.position.set(x,groundY(x,z)+.6,z);scene.add(g);const c=type==='shield'?'#7dddff':type==='med'?'#e8ff9a':'#ffda8f';const m=box(.6,.6,.6,c,0,0,0,g);m.rotation.z=.25;const beam=mesh(new THREE.CylinderGeometry(.28,.6,3,12),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.12,depthWrite:false}),g);beam.position.y=.6;pickups.push({g,type,active:true});}
const buildGroup=new THREE.Group();scene.add(buildGroup);let builtObstacles=[];
const raycaster=new THREE.Raycaster(),direction=new THREE.Vector3();
const keys=new Set();let yaw=0,pitch=-.1,vertical=0,grounded=true,mouseDown=false,aiming=false;
let weaponIndex=0;
const loadout=WEAPONS.map(w=>({ammo:w.capacity,reserve:w.reserve}));
let state='menu',health=100,shield=50,ammo=30,reserve=180,meds=2,walls=8,kills=0,elapsed=0,stormRadius=112;
let fireCooldown=0,reloadTimer=0,healTimer=0,noticeTimer=0,hitTimer=0,damageTimer=0,menuTime=0;
let audioOn=false,audioContext;
function tone(freq,duration,type='sine',volume=.04){if(!audioOn)return;audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),v=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(freq*.3,30),audioContext.currentTime+duration);v.gain.setValueAtTime(volume,audioContext.currentTime);v.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(v);v.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}
$('sound').onclick=()=>{audioOn=!audioOn;$('sound').textContent=audioOn?'SOUND ON':'SOUND OFF';if(audioOn)tone(500,.15);};
function notice(text){$('notification').textContent=text;noticeTimer=3;}
function updateHUD(){
  $('health-bar').style.width=health+'%';$('shield-bar').style.width=shield+'%';
  $('health-number').textContent=Math.ceil(health);$('shield-number').textContent=Math.ceil(shield);
  $('ammo').textContent=reloadTimer>0?'··':ammo;$('reserve').textContent=reserve;
  $('kills').textContent=kills;$('alive').textContent=combatants.filter(actor=>actor.alive).length;
  $('med-count').textContent=`H · MEDKIT × ${meds}`;$('wall-count').textContent=`Q · WALL × ${walls}`;
  $('weapon-name').textContent=healTimer>0?'HEALING…':reloadTimer>0?'RELOADING…':WEAPONS[weaponIndex].name;
  document.querySelectorAll('[data-weapon]').forEach((slot,i)=>{
    slot.classList.toggle('selected',i===weaponIndex);
    slot.setAttribute('aria-pressed',String(i===weaponIndex));
    slot.querySelector('.slot-ammo').textContent=i===weaponIndex?ammo:loadout[i].ammo;
  });
}
function switchWeapon(index){
  if(index===weaponIndex||index<0||index>=WEAPONS.length)return;
  loadout[weaponIndex]={ammo,reserve};weaponIndex=index;
  ({ammo,reserve}=loadout[index]);reloadTimer=0;healTimer=0;equipActor(player,index);
  // Switching cannot bypass the cooldown of a previously fired weapon.
  updateHUD();tone(230,.07,'triangle',.015);
}
function addAmmo(){
  loadout[weaponIndex]={ammo,reserve};
  for(let i=0;i<WEAPONS.length;i++)loadout[i].reserve+=i===2?8:40;
  reserve=loadout[weaponIndex].reserve;
}
function addKillFeed(message){
  const line=document.createElement('div');line.textContent=message;
  $('kill-feed').prepend(line);
  while($('kill-feed').children.length>4)$('kill-feed').lastElementChild.remove();
  setTimeout(()=>line.remove(),6500);
}
function showOverlay(label,title,description,ended=false){$('overlay-label').textContent=label;$('overlay-title').textContent=title;$('overlay-description').textContent=description;$('resume').classList.toggle('hidden',ended);$('overlay').classList.remove('hidden');}
function pause(){if(state!=='playing')return;state='paused';mouseDown=false;aiming=false;showOverlay('TAKE A BREATHER','Paused.','Your island will be right here.');document.exitPointerLock?.();}
function finish(won){state='ended';mouseDown=false;document.exitPointerLock?.();showOverlay(won?'LAST ONE STANDING':'BACK TO THE LOBBY?',won?'Victory.':'Next time.',`${kills} eliminations · ${Math.floor(elapsed/60)}m ${Math.floor(elapsed%60)}s survived. ${won?'The Lowlands are yours.':'Every drop is a fresh start.'}`,true);tone(won?800:160,.6);}
function resume(){canvas.requestPointerLock?.();state='playing';$('overlay').classList.add('hidden');}
function start(){health=100;shield=50;meds=2;walls=8;kills=0;elapsed=0;stormRadius=112;fireCooldown=reloadTimer=healTimer=0;yaw=0;pitch=-.1;vertical=0;grounded=true;keys.clear();mouseDown=false;aiming=false;weaponIndex=0;
WEAPONS.forEach((w,i)=>loadout[i]={ammo:w.capacity,reserve:w.reserve});({ammo,reserve}=loadout[0]);equipActor(player,0);
player.alive=true;player.health=100;player.root.position.set(0,groundY(0,28),28);player.root.visible=true;player.root.rotation.y=0;
for(let i=0;i<bots.length;i++){const b=bots[i];b.health=100;b.shield=50;b.alive=true;b.root.visible=true;b.target=null;b.targetTimer=0;b.reloadTimer=0;b.ammo=WEAPONS[b.weaponIndex].capacity;b.recoil=0;b.flashTime=0;b.root.position.set(spawnPoints[i][0],groundY(...spawnPoints[i]),spawnPoints[i][1]);b.cooldown=2+b.skill.reaction+random()*2;}
$('kill-feed').replaceChildren();
for(const p of pickups){p.active=true;p.g.visible=true;}
for(const child of [...buildGroup.children]){child.traverse(o=>o.geometry?.dispose());buildGroup.remove(child);}
for(const ob of builtObstacles){const i=obstacles.indexOf(ob);if(i!==-1)obstacles.splice(i,1);}builtObstacles=[];
$('menu').classList.add('hidden');$('menu-footer').classList.add('hidden');$('island-note').classList.add('hidden');$('hud').classList.remove('hidden');document.body.classList.add('playing');resume();notice('FREE FOR ALL · EVERY RIVAL FOR THEMSELVES\n1 / 2 / 3 · Switch weapons    RIGHT CLICK · Aim');updateHUD();updateCamera(1);}
$('play').onclick=start;$('resume').onclick=resume;$('restart').onclick=start;
$('help').onclick=()=>{if(state==='playing')pause();else if(state==='menu')showOverlay('KNOW YOUR MOVES','Ready to drop?','Free for all: rivals fight each other, too. Outlast everyone and stay ahead of the storm.',true);};
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement!==canvas&&state==='playing')pause();});
document.addEventListener('pointerlockerror',()=>{if(state==='playing'){state='paused';showOverlay('MOUSE CAPTURE UNAVAILABLE','One more click.','Allow mouse capture in your browser, then click Back to it.');}});
window.addEventListener('blur',()=>{keys.clear();pause();});
document.addEventListener('mousemove',e=>{if(state==='playing'&&document.pointerLockElement===canvas){yaw-=e.movementX*.0024;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.002,-.78,.65);}});
document.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat||state!=='playing')return;if(e.code==='KeyR')reload();if(e.code==='KeyQ')build();if(e.code==='KeyH')heal();if(/^Digit[123]$/.test(e.code))switchWeapon(Number(e.code.slice(-1))-1);if(e.code==='Escape')pause();});
document.addEventListener('keyup',e=>keys.delete(e.code));
canvas.addEventListener('mousedown',e=>{if(state!=='playing')return;if(e.button===0)mouseDown=true;if(e.button===2)aiming=true;});document.addEventListener('mouseup',e=>{if(e.button===0)mouseDown=false;if(e.button===2)aiming=false;});canvas.addEventListener('contextmenu',e=>e.preventDefault());
function reload(){if(reloadTimer||ammo===WEAPONS[weaponIndex].capacity||reserve<=0||healTimer)return;reloadTimer=WEAPONS[weaponIndex].reload;updateHUD();tone(200,.12,'triangle');}
function heal(){if(healTimer||health>=100||meds<1||reloadTimer)return;healTimer=2.4;notice('PATCHING UP… 2.4s');updateHUD();}
function build(){if(walls<=0){notice('NO BUILD MATERIALS LEFT');return;}const p=player.root.position;const x=p.x-Math.sin(yaw)*4,z=p.z-Math.cos(yaw)*4;if(obstacles.some(o=>Math.abs(x-o.x)<o.w/2+2&&Math.abs(z-o.z)<o.d/2+1)){notice('CANNOT BUILD HERE');return;}const g=new THREE.Group();g.position.set(x,groundY(x,z),z);g.rotation.y=yaw;buildGroup.add(g);for(let i=0;i<7;i++)box(.52,3.2,.22,i%2?'#9f8055':'#b59865',(i-3)*.55,1.6,0,g);for(const y of [.5,2.5])box(4,.16,.3,'#77674c',0,y,.1,g);const ob={x,z,w:Math.abs(Math.cos(yaw))*4+Math.abs(Math.sin(yaw))*.4,d:Math.abs(Math.sin(yaw))*4+Math.abs(Math.cos(yaw))*.4,h:3.2,y:groundY(x,z)};obstacles.push(ob);builtObstacles.push(ob);walls--;tone(120,.12,'square');updateHUD();}
function canStand(x,z,feet){if(Math.hypot(x,z)>124)return false;return !obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.4&&Math.abs(z-o.z)<o.d/2+.4&&feet<o.y+o.h);}
function moveActor(actor,dx,dz){const p=actor.root.position;if(canStand(p.x+dx,p.z,p.y))p.x+=dx;if(canStand(p.x,p.z+dz,p.y))p.z+=dz;}
function coverObjects(){return [terrain,...decor.children,...buildGroup.children];}
function visibleHit(hit){for(let node=hit.object;node;node=node.parent){if(!node.visible)return false;}return true;}
function occluded(from,to){direction.copy(to).sub(from);const distance=direction.length();direction.normalize();raycaster.set(from,direction);raycaster.far=distance;const hits=raycaster.intersectObjects(coverObjects(),true);return Boolean(hits.length&&hits[0].distance<distance-.3);}
const tracers=[];
function tracer(from,to,color){const geo=new THREE.BufferGeometry().setFromPoints([from.clone(),to.clone()]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity:.9}));scene.add(line);tracers.push({line,time:.09});}
function eliminate(victim,attacker=null){
  if(!victim.alive)return;
  victim.alive=false;victim.health=0;victim.target=null;victim.flash.visible=false;
  if(victim!==player)victim.root.visible=false;
  addKillFeed(`${attacker?.label||'STORM'}  ›  ${victim.label}`);
  if(attacker===player){kills++;reserve+=WEAPONS[weaponIndex].pellets>1?3:24;notice(`ELIMINATED · ${victim.label}`);}
  updateHUD();
  if(victim===player)finish(false);
  else if(player.alive&&bots.every(b=>!b.alive))finish(true);
}
function damageActor(victim,amount,attacker=null,stormHit=false){
  if(state!=='playing'||!victim.alive)return;
  if(victim===player){
    healTimer=0;
    if(!stormHit){const absorb=Math.min(shield,amount);shield-=absorb;amount-=absorb;damageTimer=.3;tone(75,.1,'triangle');}
    health=Math.max(0,health-amount);victim.health=health;
  }else{
    if(!stormHit){const absorb=Math.min(victim.shield,amount);victim.shield-=absorb;amount-=absorb;}
    victim.health=Math.max(0,victim.health-amount);
    // An attacked rival can retaliate against any living shooter.
    if(attacker?.alive&&victim.target!==attacker){victim.target=attacker;victim.targetTimer=victim.skill.reaction;victim.cooldown=Math.max(victim.cooldown,victim.skill.reaction);}
  }
  if(attacker===player){hitTimer=.17;tone(700,.05,'triangle',.015);}
  if(victim.health<=0)eliminate(victim,attacker);
  updateHUD();
}
function hurt(amount,stormHit=false){damageActor(player,amount,null,stormHit);}
function resolveShot(shooter,from,forward,spec,spread){
  actorGroup.updateMatrixWorld(true);
  const cover=coverObjects();
  shooter.flashTime=.065;shooter.recoil=spec.recoil;shooter.flash.visible=true;
  // A barrel clipped into a wall cannot bypass the wall's front face.
  const shoulder=shooter.root.position.clone().add(new THREE.Vector3(0,1.7,0));
  const toMuzzle=from.clone().sub(shoulder);
  raycaster.set(shoulder,toMuzzle.clone().normalize());raycaster.far=toMuzzle.length();
  const blocked=raycaster.intersectObjects(cover,true).find(visibleHit);
  if(blocked){tracer(shoulder,blocked.point,'#ffdf9d');return;}
  for(let pellet=0;pellet<spec.pellets;pellet++){
    if(state!=='playing')break;
    const shotDirection=spreadDirection(forward,spread,random);
    raycaster.set(from,shotDirection);raycaster.far=spec.range;
    const hitables=[...combatants.filter(a=>a!==shooter&&a.alive).map(a=>a.root),...cover];
    const hit=raycaster.intersectObjects(hitables,true).find(visibleHit);
    const end=hit?hit.point:from.clone().addScaledVector(shotDirection,spec.range);
    tracer(from,end,shooter===player?'#fff0a3':'#ffc194');
    if(!hit)continue;
    let root=hit.object;while(root.parent&&root.parent!==actorGroup)root=root.parent;
    const victim=combatants.find(a=>a.root===root);
    if(!victim||!victim.alive)continue;
    const falloff=spec.pellets>1?Math.max(.15,1-hit.distance/spec.range):Math.max(.65,1-hit.distance/(spec.range*3));
    const headshot=spec.pellets===1&&hit.point.y>victim.root.position.y+2.02?1.5:1;
    damageActor(victim,spec.damage*falloff*headshot,shooter);
  }
}
function shoot(){
  if(fireCooldown||reloadTimer||healTimer)return;
  if(ammo<=0){reload();return;}
  const spec=WEAPONS[weaponIndex];ammo--;fireCooldown=spec.interval;
  tone(spec.frequency+random()*15,.1,'sawtooth',spec.pellets>1?.07:.045);
  camera.updateMatrixWorld(true);actorGroup.updateMatrixWorld(true);
  raycaster.setFromCamera(new THREE.Vector2(0,0),camera);raycaster.far=spec.range;
  const aimHits=raycaster.intersectObjects([...bots.filter(b=>b.alive).map(b=>b.root),...coverObjects()],true).filter(visibleHit);
  const aimPoint=aimHits[0]?.point||raycaster.ray.at(spec.range,new THREE.Vector3());
  const from=player.muzzle.getWorldPosition(new THREE.Vector3());
  // Cast from the muzzle, so an over-the-shoulder camera cannot fire through cover.
  resolveShot(player,from,aimPoint.clone().sub(from).normalize(),spec,aiming?spec.aimSpread:spec.spread);
  updateHUD();
}
function animateWeapon(actor,dt){
  actor.flashTime=Math.max(0,actor.flashTime-dt);actor.flash.visible=actor.flashTime>0;
  actor.recoil=Math.max(0,actor.recoil-dt*.9);
  const reloading=actor===player?reloadTimer>0:actor.reloadTimer>0;
  actor.gun.rotation.x=(actor===player?pitch:actor.aimPitch||0)+actor.recoil+(reloading?-.55:0);
  actor.gun.rotation.z=reloading?-.28:0;
  actor.gun.position.z=-.36+actor.recoil*.4;
  actor.arms[0].rotation.x=1.15;actor.arms[0].rotation.z=.6;
  actor.arms[1].rotation.x=1.1;actor.arms[1].rotation.z=-.12;
  const pump=actor.models.get(actor.weaponIndex).pump;
  if(pump)pump.position.z=-.49+Math.sin(Math.min(1,actor.recoil/.22)*Math.PI)*.12;
}
function updateCamera(dt){const p=player.root.position,lookPitch=pitch+player.recoil*.18,forward=new THREE.Vector3(-Math.sin(yaw)*Math.cos(lookPitch),Math.sin(lookPitch),-Math.cos(yaw)*Math.cos(lookPitch));const pivot=new THREE.Vector3(p.x,p.y+1.85,p.z);const desired=pivot.clone().addScaledVector(forward,aiming?-3.4:-5.6).add(new THREE.Vector3(Math.cos(yaw)*1.25,.4,-Math.sin(yaw)*1.25));desired.y=Math.max(desired.y,groundY(desired.x,desired.z)+.65);camera.position.lerp(desired,Math.min(1,dt*16));camera.lookAt(pivot.clone().addScaledVector(forward,65));camera.fov=THREE.MathUtils.lerp(camera.fov,aiming?43:56,Math.min(1,dt*12));camera.updateProjectionMatrix();$('crosshair').classList.toggle('aiming',aiming);}
const map=$('minimap').getContext('2d');
function drawMap(){map.clearRect(0,0,180,180);map.fillStyle='#679e9e';map.fillRect(0,0,180,180);map.fillStyle='#6c8e46';map.beginPath();map.arc(90,90,82,0,Math.PI*2);map.fill();map.strokeStyle='#bdad7e';map.lineWidth=3;map.beginPath();map.moveTo(95,45);map.lineTo(95,130);map.stroke();for(const o of obstacles){map.fillStyle='#b7b498';map.fillRect(90+o.x*.65-o.w*.32,90+o.z*.65-o.d*.32,Math.max(1,o.w*.65),Math.max(1,o.d*.65));}map.strokeStyle='#e3c1ff';map.lineWidth=2;map.beginPath();map.arc(90,90,stormRadius*.65,0,Math.PI*2);map.stroke();map.fillStyle='#f5b39d';for(const b of bots){if(b.alive){map.beginPath();map.arc(90+b.root.position.x*.65,90+b.root.position.z*.65,2,0,Math.PI*2);map.fill();}}map.save();map.translate(90+player.root.position.x*.65,90+player.root.position.z*.65);map.rotate(-yaw);map.fillStyle='#fffcd6';map.beginPath();map.moveTo(0,-6);map.lineTo(4,4);map.lineTo(0,2);map.lineTo(-4,4);map.closePath();map.fill();map.restore();}
let mapTimer=0;
function updateBots(dt,playerMoving){
  for(const bot of bots){
    if(!bot.alive||state!=='playing')continue;
    animateWeapon(bot,dt);
    const bp=bot.root.position,spec=WEAPONS[bot.weaponIndex];
    bot.targetTimer-=dt;
    if(bot.targetTimer<=0||!bot.target?.alive){
      const eye=bp.clone().add(new THREE.Vector3(0,1.7,0));
      const previousTarget=bot.target;
      bot.target=chooseTarget(bot,combatants,candidate=>
        !occluded(eye,candidate.root.position.clone().add(new THREE.Vector3(0,1.5,0))));
      bot.targetTimer=bot.skill.reaction+random()*.3;
      if(bot.target!==previousTarget)bot.cooldown=Math.max(bot.cooldown,bot.skill.reaction);
    }
    const target=bot.target;
    if(!target)continue;
    const tp=target.root.position;
    const dx=tp.x-bp.x,dz=tp.z-bp.z,dist=Math.hypot(dx,dz)||1;
    bot.root.rotation.y=Math.atan2(-dx,-dz);
    bot.aimPitch=Math.atan2(tp.y-bp.y,dist);
    bot.phase+=dt*7;
    let vx=0,vz=0;
    if(Math.hypot(bp.x,bp.z)>stormRadius-4){
      // Seek safety instead of continuing to pursue a rival outside the circle.
      const radius=Math.hypot(bp.x,bp.z)||1;vx=-bp.x/radius*4.5;vz=-bp.z/radius*4.5;
    }else{
      const advance=dist>spec.preferredRange?3:dist<spec.preferredRange*.55?-2:0;
      const strafe=Math.sin(elapsed*.7+bots.indexOf(bot)*1.7)*1.5;
      vx=dx/dist*advance+dz/dist*strafe;vz=dz/dist*advance-dx/dist*strafe;
    }
    moveActor(bot,vx*dt*bot.skill.speed,vz*dt*bot.skill.speed);bp.y=groundY(bp.x,bp.z);
    bot.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(bot.phase+i*Math.PI)*.45);
    if(bot.reloadTimer>0){
      bot.reloadTimer=Math.max(0,bot.reloadTimer-dt);
      if(bot.reloadTimer===0)bot.ammo=spec.capacity;
    }
    bot.cooldown=Math.max(0,bot.cooldown-dt);
    if(bot.cooldown===0&&bot.reloadTimer===0&&dist<Math.min(52,spec.range)&&target.alive){
      const eye=bp.clone().add(new THREE.Vector3(0,1.7,0));
      const aim=tp.clone().add(new THREE.Vector3(0,1.5,0));
      if(!occluded(eye,aim)){
        bot.root.updateMatrixWorld(true);
        const from=bot.muzzle.getWorldPosition(new THREE.Vector3());
        const forward=aim.sub(from).normalize();
        const movingTarget=target===player?playerMoving:true;
        const spread=spec.spread+bot.skill.spread*(movingTarget?1.25:1);
        resolveShot(bot,from,forward,spec,spread);
        bot.ammo--;
        // Short bursts and pauses leave time to reposition; all opponents use the same rules.
        bot.cooldown=spec.interval+bot.skill.pause+random()*.35;
        if(bot.ammo<=0)bot.reloadTimer=spec.reload;
      }else bot.targetTimer=0;
    }
    if(Math.hypot(bp.x,bp.z)>stormRadius)damageActor(bot,dt*7,null,true);
  }
}
function update(dt){elapsed+=dt;fireCooldown=Math.max(0,fireCooldown-dt);animateWeapon(player,dt);hitTimer=Math.max(0,hitTimer-dt);damageTimer=Math.max(0,damageTimer-dt);$('hitmarker').style.opacity=hitTimer>0?1:0;$('damage-flash').style.opacity=damageTimer*1.4;
if(reloadTimer>0){reloadTimer-=dt;if(reloadTimer<=0){const take=Math.min(WEAPONS[weaponIndex].capacity-ammo,reserve);ammo+=take;reserve-=take;reloadTimer=0;updateHUD();}}
if(healTimer>0){healTimer-=dt;if(healTimer<=0){meds--;health=Math.min(100,health+60);player.health=health;healTimer=0;notice('+60 HEALTH');tone(600,.2);updateHUD();}}
if(noticeTimer>0){noticeTimer-=dt;$('notification').style.opacity=Math.min(noticeTimer,1);}else $('notification').style.opacity=0;
const p=player.root.position;let f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));let r=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));const length=Math.hypot(f,r)||1;f/=length;r/=length;const speed=aiming?3.8:keys.has('ShiftLeft')||keys.has('ShiftRight')?11:7;moveActor(player,(-Math.sin(yaw)*f+Math.cos(yaw)*r)*speed*dt,(-Math.cos(yaw)*f-Math.sin(yaw)*r)*speed*dt);
if(keys.has('Space')&&grounded){vertical=8;grounded=false;tone(160,.1,'sine',.02);}vertical-=21*dt;p.y+=vertical*dt;const floor=groundY(p.x,p.z);if(p.y<=floor){p.y=floor;vertical=0;grounded=true;}
player.root.rotation.y=yaw;const running=Boolean(f||r);player.phase+=dt*speed*1.7;player.legs.forEach((leg,i)=>leg.rotation.x=running?Math.sin(player.phase+i*Math.PI)*.65:0);player.body.position.y=running&&grounded?Math.sin(player.phase*2)*.035:0;updateCamera(dt);
if(mouseDown)shoot();if(state!=='playing')return;
updateBots(dt,running);
if(state!=='playing')return;if(bots.every(b=>!b.alive)){finish(true);return;}
stormRadius=Math.max(14,112-Math.max(0,elapsed-40)*.43);storm.scale.set(stormRadius,1,stormRadius);ring.scale.set(stormRadius,stormRadius,1);const outside=Math.hypot(p.x,p.z)>stormRadius;$('storm-warning').classList.toggle('hidden',!outside);if(outside)hurt(dt*6,true);
const stormTime=elapsed<40?Math.ceil(40-elapsed):Math.ceil((stormRadius-14)/.43);$('storm-time').textContent=`${Math.floor(stormTime/60)}:${String(stormTime%60).padStart(2,'0')}`;
for(const item of pickups){if(!item.active)continue;item.g.rotation.y+=dt;item.g.position.y=groundY(item.g.position.x,item.g.position.z)+.7+Math.sin(elapsed*2)*.15;if(item.g.position.distanceTo(p)<2.3){item.active=false;item.g.visible=false;if(item.type==='ammo'){addAmmo();notice('+40 RIFLE AMMO · +8 SHELLS');}else if(item.type==='shield'){shield=Math.min(100,shield+35);notice('+35 SHIELD');}else{meds++;notice('+1 MEDKIT');}tone(900,.16,'triangle');updateHUD();}}
const deg=((THREE.MathUtils.radToDeg(yaw)%360)+360)%360;const dirs=['N','NW','W','SW','S','SE','E','NE'];$('compass').textContent=`${dirs[Math.round(deg/45)%8]}   ·   ${Math.round(deg)}°`;
mapTimer-=dt;if(mapTimer<=0){drawMap();mapTimer=.12;}
}
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;
if(state==='menu'){menuTime+=dt;camera.position.set(42+Math.sin(menuTime*.035)*4,19,58);camera.lookAt(0,3,-5);player.root.position.set(26,groundY(26,32),32);player.root.rotation.y=-.6;storm.scale.set(112,1,112);ring.scale.set(112,112,1);}
else if(state==='playing')update(dt);
for(let i=tracers.length-1;i>=0;i--){const t=tracers[i];t.time-=dt;t.line.material.opacity=Math.max(0,t.time/.09);if(t.time<=0){scene.remove(t.line);t.line.geometry.dispose();t.line.material.dispose();tracers.splice(i,1);}}
clouds.rotation.y+=dt*.001;renderer.render(scene,camera);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
if(matchMedia('(pointer: coarse)').matches){$('unsupported').classList.remove('hidden');$('unsupported').textContent='Desktop game · Use a keyboard and mouse to play.';}
updateHUD();requestAnimationFrame(frame);
