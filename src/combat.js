/** Hunters pursue their assigned opponent; other bots prefer nearby visible rivals. */
export function chooseTarget(shooter, combatants, canSee = () => true, sightRange = 52) {
  if (shooter.huntTarget?.alive && shooter.huntTarget !== shooter && combatants.includes(shooter.huntTarget)) {
    return shooter.huntTarget;
  }
  let closest = null;
  let visible = null;
  let closestDistance = Infinity;
  let visibleDistance = Infinity;
  for (const candidate of combatants) {
    if (candidate === shooter || !candidate.alive) continue;
    const distance = shooter.root.position.distanceTo(candidate.root.position);
    if (distance < closestDistance) {
      closest = candidate;
      closestDistance = distance;
    }
    if (distance < sightRange && distance < visibleDistance && canSee(candidate)) {
      visible = candidate;
      visibleDistance = distance;
    }
  }
  return visible || closest;
}

export function spreadDirection(forward, spread, random = Math.random) {
  const result = forward.clone();
  // Uniform disk spread around the aim direction, including shots aimed vertically.
  const reference = Math.abs(forward.y) > .95 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  const right = forward.clone().cross(reference).normalize();
  const up = right.clone().cross(forward).normalize();
  const radius = Math.sqrt(random()) * spread;
  const angle = random() * Math.PI * 2;
  return result.addScaledVector(right, Math.cos(angle) * radius)
    .addScaledVector(up, Math.sin(angle) * radius).normalize();
}
