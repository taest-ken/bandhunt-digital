// Great-circle distance between two [lng, lat] coordinates in meters
export function calculateHaversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate bearing (in degrees 0-360) from coord1 [lng, lat] to coord2 [lng, lat]
export function calculateBearing(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const y = Math.sin(((lng2 - lng1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lng2 - lng1) * Math.PI) / 180);

  const initialBearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (initialBearing + 360) % 360;
}

// Convert distance (meters) to normalized proximity scalar p (0.0 to 1.0)
// maxDistance: 4000m (4km) -> 0.0
// lockInDistance: 30m -> 1.0
export function distanceToProximity(distanceMeters: number): number {
  const maxDistance = 3500; // 3.5 km detection horizon
  const minDistance = 25; // 25 meters lock-in threshold

  if (distanceMeters <= minDistance) return 1.0;
  if (distanceMeters >= maxDistance) return 0.0;

  // Non-linear perceptual scaling (higher sensitivity as you get closer)
  const normalized = (maxDistance - distanceMeters) / (maxDistance - minDistance);
  return Math.pow(normalized, 1.4);
}
