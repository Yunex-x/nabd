/**
 * Return the Qibla bearing (degrees clockwise from geographic north)
 * for a given user location using the great-circle initial bearing formula.
 *
 * Kaaba coordinates (fixed):
 *   Latitude:  21.4225
 *   Longitude: 39.8262
 *
 * Steps:
 *  - convert degrees -> radians
 *  - deltaLon = kaabaLon - userLon (radians)
 *  - θ = atan2( sin(deltaLon) * cos(kaabaLat),
 *               cos(userLat) * sin(kaabaLat) - sin(userLat) * cos(kaabaLat) * cos(deltaLon) )
 *  - convert θ -> degrees and normalize to [0, 360)
 */

export function getQiblaBearing(userLatitude: number, userLongitude: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  // Kaaba coordinates (degrees)
  const kaabaLatDeg = 21.4225;
  const kaabaLonDeg = 39.8262;

  // Convert all lat/lon to radians
  const phi1 = toRad(userLatitude);
  const phi2 = toRad(kaabaLatDeg);
  const deltaLon = toRad(kaabaLonDeg - userLongitude);

  // Great-circle initial bearing formula
  const y = Math.sin(deltaLon) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLon);

  let theta = Math.atan2(y, x); // in radians

  // Convert to degrees
  let bearing = toDeg(theta);

  // Normalize to [0, 360)
  bearing = (bearing + 360) % 360;

  if (!Number.isFinite(bearing)) return 0;
  return bearing;
}

export default getQiblaBearing;