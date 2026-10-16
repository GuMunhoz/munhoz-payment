import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCardMask]',
  standalone: true
})
export class CardMaskDirective {
  @Input('appCardMask') maskType: 'cardNumber' | 'expiration' | 'cvv' = 'cardNumber';

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    let value = input.value;

    if (this.maskType === 'cardNumber') {
      // Keep only digits, max 19 digits, format in groups of 4
      const digits = value.replace(/\D/g, '').substring(0, 19);
      const parts: string[] = [];
      for (let i = 0; i < digits.length; i += 4) {
        parts.push(digits.substring(i, i + 4));
      }
      input.value = parts.join(' ');
    } else if (this.maskType === 'expiration') {
      // Keep only digits, max 4 digits, format MM/AA
      const digits = value.replace(/\D/g, '').substring(0, 4);
      if (digits.length >= 3) {
        input.value = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
      } else {
        input.value = digits;
      }
    } else if (this.maskType === 'cvv') {
      // Only digits, max 4 digits
      input.value = value.replace(/\D/g, '').substring(0, 4);
    }
  }
}
