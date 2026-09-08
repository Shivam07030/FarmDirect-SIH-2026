import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  locationName: string;
}

export async function requestLocationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const check = await Geolocation.checkPermissions();
      if (check.location === 'granted') return true;
      const res = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] });
      return res.location === 'granted';
    } catch {
      return false;
    }
  }

  // Web browser
  if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state === 'granted';
    } catch {
      return true;
    }
  }
  return true;
}

export async function getCurrentCoordinates(): Promise<LocationResult> {
  // 1. Native platform (Capacitor Android APK / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      await requestLocationPermission();
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;
      const accuracy = coordinates.coords.accuracy;

      return {
        latitude: lat,
        longitude: lng,
        accuracy,
        locationName: getApproximateRegion(lat, lng),
      };
    } catch (err: any) {
      console.warn('Native geolocation failed or denied:', err);
    }
  }

  // 2. Web browser platform: explicitly call navigator.geolocation
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            locationName: getApproximateRegion(pos.coords.latitude, pos.coords.longitude),
          });
        },
        (err) => {
          console.warn('Browser geolocation error / denied:', err.message);
          resolve({
            latitude: 27.1767,
            longitude: 78.0081,
            accuracy: 25,
            locationName: 'Agra Farm Cluster',
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  return {
    latitude: 27.1767,
    longitude: 78.0081,
    accuracy: 25,
    locationName: 'Agra Farm Cluster',
  };
}

function getApproximateRegion(lat: number, lng: number): string {
  const agraDist = Math.hypot(lat - 27.1767, lng - 78.0081);
  const mathuraDist = Math.hypot(lat - 27.4924, lng - 77.6737);
  const aligarhDist = Math.hypot(lat - 27.8974, lng - 78.0880);
  const delhiDist = Math.hypot(lat - 28.6139, lng - 77.2090);

  const min = Math.min(agraDist, mathuraDist, aligarhDist, delhiDist);
  if (min === agraDist) return 'Agra Region (UP)';
  if (min === mathuraDist) return 'Mathura Belt (UP)';
  if (min === aligarhDist) return 'Aligarh Cluster (UP)';
  return 'Delhi NCR Hub';
}
