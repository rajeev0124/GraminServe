import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance',
  standalone: true
})
export class DistancePipe implements PipeTransform {
  transform(metres: number): string {
    if (metres < 1000) return `${metres} m`;
    const km = metres / 1000;
    return `${km % 1 === 0 ? km : km.toFixed(1)} km`;
  }
}
