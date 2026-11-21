import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP, STORM, BOT_ROSTER, MINIMAP_SCALE, stormRadiusAt, stormTimeRemaining } from '../src/match.js';

test('expanded island fits the terrain, minimap and starting storm',()=>{
  assert.ok(MAP.radius**2 / 124**2 > 3);
  assert.ok(MAP.terrainSize / 2 > MAP.radius);
  assert.ok(STORM.initial < MAP.radius);
  assert.equal(MAP.radius * MINIMAP_SCALE,82);
});

test('larger roster retains a majority of easier opponents',()=>{
  assert.equal(BOT_ROSTER.length,20);
  assert.equal(BOT_ROSTER.filter(skill=>skill===0).length,12);
  assert.equal(BOT_ROSTER.filter(skill=>skill===1).length,6);
  assert.equal(BOT_ROSTER.filter(skill=>skill===2).length,2);
});

test('storm allows exploration, closes gradually and stops at the final circle',()=>{
  assert.equal(stormRadiusAt(0),STORM.initial);
  assert.equal(stormRadiusAt(90),STORM.initial);
  assert.ok(stormRadiusAt(180)<STORM.initial);
  assert.ok(stormRadiusAt(480)>STORM.minimum);
  assert.equal(stormRadiusAt(10000),STORM.minimum);
  assert.equal(stormTimeRemaining(0),90);
  assert.equal(stormTimeRemaining(10000),0);
});
