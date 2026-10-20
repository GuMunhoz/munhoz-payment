import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CardValidators } from './card.validators';

describe('CardValidators', () => {
  describe('luhn', () => {
    it('should validate valid card numbers (Luhn)', () => {
      const validator = CardValidators.luhn();
      expect(validator(new FormControl('4242424242424242'))).toBeNull();
      expect(validator(new FormControl('4242 4242 4242 4242'))).toBeNull();
    });

    it('should invalidate invalid card numbers', () => {
      const validator = CardValidators.luhn();
      expect(validator(new FormControl('4242424242424241'))).toEqual({
        luhn: { message: 'Número inválido. Confira os dígitos do cartão.' }
      });
    });

    it('should invalidate too short or too long card numbers', () => {
      const validator = CardValidators.luhn();
      expect(validator(new FormControl('12345'))).toEqual({
        luhn: { message: 'Número inválido. Confira os dígitos do cartão.' }
      });
    });
  });

  describe('expiration', () => {
    it('should accept valid future date', () => {
      const validator = CardValidators.expiration();
      expect(validator(new FormControl('12/29'))).toBeNull();
    });

    it('should reject expired date', () => {
      const validator = CardValidators.expiration();
      expect(validator(new FormControl('01/20'))).toEqual({
        expired: { message: 'Cartão vencido.' }
      });
    });

    it('should reject invalid format', () => {
      const validator = CardValidators.expiration();
      expect(validator(new FormControl('99/99'))).toEqual({
        expiration: { message: 'Formato deve ser MM/AA' }
      });
    });
  });

  describe('cvv', () => {
    it('should accept 3 or 4 digits', () => {
      const validator = CardValidators.cvv();
      expect(validator(new FormControl('123'))).toBeNull();
      expect(validator(new FormControl('1234'))).toBeNull();
    });

    it('should reject letters or wrong length', () => {
      const validator = CardValidators.cvv();
      expect(validator(new FormControl('12'))).toEqual({
        cvv: { message: 'Use 3 ou 4 dígitos.' }
      });
      expect(validator(new FormControl('12345'))).toEqual({
        cvv: { message: 'Use 3 ou 4 dígitos.' }
      });
      expect(validator(new FormControl('12a'))).toEqual({
        cvv: { message: 'Use 3 ou 4 dígitos.' }
      });
    });
  });

  describe('cardHolder', () => {
    it('should accept full name', () => {
      const validator = CardValidators.cardHolder();
      expect(validator(new FormControl('Maria Almeida'))).toBeNull();
      expect(validator(new FormControl('MARIA A ALMEIDA'))).toBeNull();
    });

    it('should reject single name', () => {
      const validator = CardValidators.cardHolder();
      expect(validator(new FormControl('Maria'))).toEqual({
        cardHolder: { message: 'Informe o nome como aparece no cartão.' }
      });
    });

    it('should reject numbers or symbols', () => {
      const validator = CardValidators.cardHolder();
      expect(validator(new FormControl('Maria 123'))).toEqual({
        cardHolder: { message: 'Informe o nome como aparece no cartão.' }
      });
    });
  });
});
