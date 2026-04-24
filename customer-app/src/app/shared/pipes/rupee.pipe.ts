import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rupee',
  standalone: true
})
export class RupeePipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  });

  transform(amount: number): string {
    return this.formatter.format(amount);
  }
}
