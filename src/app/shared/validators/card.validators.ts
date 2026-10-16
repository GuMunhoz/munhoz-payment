import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CardValidators {
  /**
   * Validates card number using the Luhn Algorithm (Mod 10)
   */
  static luhn(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const raw = (control.value || '').toString().replace(/\D/g, '');

      if (!raw) {
        return { required: true };
      }

      if (raw.length < 13 || raw.length > 19) {
        return { luhn: { message: 'Número de cartão deve ter entre 13 e 19 dígitos' } };
      }

      let sum = 0;
      let shouldDouble = false;

      for (let i = raw.length - 1; i >= 0; i--) {
        let digit = parseInt(raw.charAt(i), 10);

        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
      }

      const isValid = sum % 10 === 0;
      return isValid ? null : { luhn: { message: 'Número de cartão inválido' } };
    };
  }

  /**
   * Validates expiration date in MM/AA or MM/AAAA format and checks if it's in the future
   */
  static expiration(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value || '').toString().trim();

      if (!value) {
        return { required: true };
      }

      const regex = /^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/;
      const match = value.match(regex);

      if (!match) {
        return { expiration: { message: 'Formato deve ser MM/AA' } };
      }

      const month = parseInt(match[1], 10);
      let year = parseInt(match[2], 10);
      if (year < 100) {
        year += 2000;
      }

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return { expired: { message: 'Cartão vencido' } };
      }

      if (year > currentYear + 25) {
        return { expiration: { message: 'Data de validade muito distante' } };
      }

      return null;
    };
  }

  /**
   * Validates CVV (3 or 4 numeric digits)
   */
  static cvv(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value || '').toString().trim();

      if (!value) {
        return { required: true };
      }

      const isValid = /^\d{3,4}$/.test(value);
      return isValid ? null : { cvv: { message: 'CVV deve ter 3 ou 4 dígitos' } };
    };
  }

  /**
   * Validates cardholder name (must have at least first and last name)
   */
  static cardHolder(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value || '').toString().trim();

      if (!value) {
        return { required: true };
      }

      const parts = value.split(/\s+/).filter((p: string) => p.length > 0);
      if (parts.length < 2) {
        return { cardHolder: { message: 'Informe nome e sobrenome como no cartão' } };
      }

      if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return { cardHolder: { message: 'Nome não deve conter números ou símbolos' } };
      }

      return null;
    };
  }
}
