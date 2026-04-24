import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number in metres as a human-readable distance string.
 * Examples:
 *   800   → "800 m"
 *   1500  → "1.5 km"
 *   12000 → "12 km"
 */
@Pipe({ name: 'distance', standalone: true })
export class DistancePipe implements PipeTransform {
  transform(metres: number): string {
    if (metres < 1000) return `${metres} m`;
    const km = metres / 1000;
    return `${km % 1 === 0 ? km : km.toFixed(1)} km`;
  }
}
