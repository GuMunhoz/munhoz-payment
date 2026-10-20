import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { CardMaskDirective } from './card-mask.directive';

@Component({
  standalone: true,
  imports: [CardMaskDirective],
  template: `
    <input id="defaultInput" appCardMask />
    <input id="cardInput" appCardMask="cardNumber" />
    <input id="expInput" appCardMask="expiration" />
    <input id="cvvInput" appCardMask="cvv" />
  `
})
class TestHostComponent {}

describe('CardMaskDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let defaultInput: HTMLInputElement;
  let cardInput: HTMLInputElement;
  let expInput: HTMLInputElement;
  let cvvInput: HTMLInputElement;

  const triggerInput = (input: HTMLInputElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    defaultInput = fixture.nativeElement.querySelector('#defaultInput');
    cardInput = fixture.nativeElement.querySelector('#cardInput');
    expInput = fixture.nativeElement.querySelector('#expInput');
    cvvInput = fixture.nativeElement.querySelector('#cvvInput');
  });

  it('should create directive instances on host inputs', () => {
    const directiveDebugElements = fixture.debugElement.queryAll(By.directive(CardMaskDirective));
    expect(directiveDebugElements).toHaveLength(4);
  });

  describe('Default (cardNumber) mask', () => {
    it('should format 16-digit card number in blocks of 4 by default', () => {
      triggerInput(defaultInput, '1234567812345678');
      expect(defaultInput.value).toBe('1234 5678 1234 5678');
    });

    it('should strip non-numeric characters from input', () => {
      triggerInput(defaultInput, '1234-abcd-5678');
      expect(defaultInput.value).toBe('1234 5678');
    });

    it('should truncate digits beyond 19 characters', () => {
      triggerInput(defaultInput, '12345678901234567890123');
      expect(defaultInput.value).toBe('1234 5678 9012 3456 789');
    });
  });

  describe('Explicit cardNumber mask', () => {
    it('should format digits with space separators', () => {
      triggerInput(cardInput, '4111222233334444');
      expect(cardInput.value).toBe('4111 2222 3333 4444');
    });
  });

  describe('Expiration mask', () => {
    it('should keep 2 digits unformatted', () => {
      triggerInput(expInput, '12');
      expect(expInput.value).toBe('12');
    });

    it('should format month and year with slash', () => {
      triggerInput(expInput, '1228');
      expect(expInput.value).toBe('12/28');
    });

    it('should remove non-numeric characters before formatting', () => {
      triggerInput(expInput, '12/28');
      expect(expInput.value).toBe('12/28');
    });

    it('should truncate expiration digits to 4', () => {
      triggerInput(expInput, '122899');
      expect(expInput.value).toBe('12/28');
    });
  });

  describe('CVV mask', () => {
    it('should allow 3 numeric digits', () => {
      triggerInput(cvvInput, '123');
      expect(cvvInput.value).toBe('123');
    });

    it('should allow 4 numeric digits', () => {
      triggerInput(cvvInput, '1234');
      expect(cvvInput.value).toBe('1234');
    });

    it('should strip non-digits', () => {
      triggerInput(cvvInput, '12a3');
      expect(cvvInput.value).toBe('123');
    });

    it('should truncate CVV to maximum of 4 digits', () => {
      triggerInput(cvvInput, '123456');
      expect(cvvInput.value).toBe('1234');
    });
  });
});
