import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { chooseTarget, spreadDirection } from '../src/combat.js';

const actor=(name,x,z,alive=true)=>({name,alive,root:{position:new Vector3(x,0,z)}});

test('a bot selects a nearer rival rather than pursuing the human',()=>{
  const bot=actor('shooter',0,0),human=actor('human',30,0),rival=actor('rival',5,0);
  assert.equal(chooseTarget(bot,[human,bot,rival]),rival);
});

test('the human is a valid target under exactly the same distance rule',()=>{
  const bot=actor('shooter',0,0),human=actor('human',2,0),rival=actor('rival',5,0);
  assert.equal(chooseTarget(bot,[rival,bot,human]),human);
});

test('visible opponents take priority over an opponent behind cover',()=>{
  const bot=actor('shooter',0,0),hidden=actor('hidden',2,0),visible=actor('visible',10,0);
  assert.equal(chooseTarget(bot,[bot,hidden,visible],candidate=>candidate===visible),visible);
});

test('targeting skips self and eliminated rivals, and reacquires after a kill',()=>{
  const bot=actor('shooter',0,0),first=actor('first',2,0),next=actor('next',5,0);
  const actors=[bot,first,next];
  assert.equal(chooseTarget(bot,actors),first);
  first.alive=false;
  assert.equal(chooseTarget(bot,actors),next);
  next.alive=false;
  assert.equal(chooseTarget(bot,actors),null);
});

test('without line of sight a bot pursues the nearest living opponent',()=>{
  const bot=actor('shooter',0,0),far=actor('far',60,0),near=actor('near',20,0);
  assert.equal(chooseTarget(bot,[bot,far,near],()=>false),near);
});

test('weapon spread stays normalized and within its aiming cone',()=>{
  for(const forward of [new Vector3(0,0,-1),new Vector3(0,1,0)]){
    for(let i=0;i<100;i++){
      const result=spreadDirection(forward,.065);
      assert.ok(Math.abs(result.length()-1)<1e-10);
      assert.ok(result.angleTo(forward)<=Math.atan(.065)+1e-10);
    }
  }
});
