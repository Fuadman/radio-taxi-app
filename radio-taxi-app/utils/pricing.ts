export function calculatePrice(distanceKm: number): number {
  if (distanceKm <= 2) {
    return Math.ceil(distanceKm * 10); // 1-2 km: 10 Bs/km
  } else if (distanceKm <= 5) {
    return Math.ceil(distanceKm * 5); // 2.1-5 km: 5 Bs/km
  } else {
    return Math.ceil(distanceKm * 3); // >5 km: 3 Bs/km
  }
}
