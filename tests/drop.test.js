import test from 'node:test';
import assert from 'node:assert/strict';
import { DROP, busPositionAt, findLandingSpot } from '../src/drop.js';
import { MAP } from '../src/match.js';

test('bus crosses the island at a safe altitude and clamps to the route',()=>{
  const start=busPositionAt(0),end=busPositionAt(DROP.rideTime);
  assert.ok(start.z>0&&end.z<0);
  assert.ok(start.y>60&&end.y===start.y);
  for(let t=0;t<=DROP.rideTime;t++){
    const p=busPositionAt(t);
    assert.ok(Math.hypot(p.x,p.z)<MAP.radius);
  }
  assert.deepEqual(busPositionAt(-5),start);
  assert.deepEqual(busPositionAt(999),end);
});

test('landing keeps a clear location and moves an obstructed landing outside cover',()=>{
  assert.deepEqual(findLandingSpot(4,5,()=>true),{x:4,z:5});
  const canLand=(x,z)=>Math.abs(x)>6||Math.abs(z)>6;
  const spot=findLandingSpot(0,0,canLand);
  assert.ok(spot&&canLand(spot.x,spot.z));
  assert.equal(findLandingSpot(0,0,()=>false),null);
});
