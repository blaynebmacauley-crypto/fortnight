export const MAP = Object.freeze({ radius: 220, shore: 208, terrainSize: 500 });
export const STORM = Object.freeze({ initial: 205, minimum: 22, delay: 90, speed: .38 });
// Keep most opponents approachable, even as the match grows to 21 contenders.
export const BOT_ROSTER = Object.freeze([0,1,0,1,0,2,0,1,0,0,1,0,0,2,1,0,0,1,0,0]);
export const MINIMAP_SCALE = 82 / MAP.radius;

export function stormRadiusAt(seconds) {
  return Math.max(STORM.minimum, STORM.initial - Math.max(0, seconds - STORM.delay) * STORM.speed);
}

export function stormTimeRemaining(seconds) {
  return seconds < STORM.delay
    ? Math.ceil(STORM.delay - seconds)
    : Math.ceil((stormRadiusAt(seconds) - STORM.minimum) / STORM.speed);
}
