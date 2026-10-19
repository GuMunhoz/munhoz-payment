import { Directive, ElementRef, HostListener, Input } from '@angular/core';

export type MaskType = 'cardNumber' | 'expiration' | 'cvv';

@Directive({
  selector: '[appCardMask]',
  standalone: true
})
export class CardMaskDirective {
  @Input('appCardMask') maskType: MaskType = 'cardNumber';

  private readonly masks: Record<MaskType, (digits: string) => string> = {
    cardNumber: (digits) => digits.substring(0, 19).replace(/(\d{4})(?=\d)/g, '$1 '),
    expiration: (digits) => digits.substring(0, 4).replace(/^(\d{2})(\d)/, '$1/$2'),
    cvv: (digits) => digits.substring(0, 3)
  };

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    const digits = input.value.replace(/\D/g, '');
    input.value = this.masks[this.maskType](digits);
  }
}
