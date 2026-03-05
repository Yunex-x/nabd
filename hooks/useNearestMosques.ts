import { useEffect, useState } from "react";

export type NearestPlace = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  tags?: Record<string, string>;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Query Overpass API to find nearby mosques.
 * - lat, lon: center point
 * - radius: meters (default 5000)
 */
export function useNearestMosques(lat: number | null, lon: number | null, radius = 5000) {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<NearestPlace[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (lat == null || lon == null) {
      setPlaces([]);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchPlaces() {
      setLoading(true);
      setError(null);

      // Overpass QL: fetch nodes/ways/relations tagged as mosque around point
      const query = `[out:json][timeout:25];
(
  node(around:${radius},${lat},${lon})[place_of_worship=mosque];
  way(around:${radius},${lat},${lon})[place_of_worship=mosque];
  relation(around:${radius},${lat},${lon})[place_of_worship=mosque];
);
out center meta;`;

      try {
        const resp = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: query,
          signal: controller.signal,
        });

        if (!resp.ok) {
          throw new Error(`Overpass API error: ${resp.status}`);
        }

        const data = await resp.json();

        const elements = Array.isArray(data.elements) ? data.elements : [];

        const mapped: NearestPlace[] = elements
          .map((el: any) => {
            let plat = el.lat;
            let plon = el.lon;
            // ways/relations include center
            if ((!plat || !plon) && el.center) {
              plat = el.center.lat;
              plon = el.center.lon;
            }
            if (!plat || !plon) return null;
            const name =
              (el.tags && (el.tags.name || el.tags["name:ar"] || el.tags["name:en"])) || "مسجد";
            const distanceMeters = haversineDistanceMeters(lat as number, lon as number, plat, plon);
            return {
              id: `${el.type}/${el.id}`,
              name,
              lat: plat,
              lon: plon,
              distanceMeters,
              tags: el.tags || {},
            } as NearestPlace;
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a!.distanceMeters - b!.distanceMeters) as NearestPlace[];

        if (!mounted) return;
        setPlaces(mapped);
      } catch (e: any) {
        if (!mounted) return;
        if (e.name === "AbortError") return;
        setError(e.message || "Failed to fetch nearby mosques");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchPlaces();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [lat, lon, radius]);

  return { loading, places, error, refresh: () => {} }; // refresh can be added later
}