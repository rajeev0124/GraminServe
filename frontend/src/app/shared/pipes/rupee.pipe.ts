import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as Indian Rupees.
 * Examples:
 *   500   → "₹500"
 *   1500  → "₹1,500"
 *   100000 → "₹1,00,000"
 */
@Pipe({ name: 'rupee', standalone: true })
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
