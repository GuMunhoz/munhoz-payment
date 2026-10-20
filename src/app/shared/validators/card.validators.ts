import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CardValidators {

  static luhn(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const digits = (control.value ?? '').toString().replace(/\D/g, '');
      if (!digits) return { required: true };

      if (digits.length < 13 || digits.length > 19) {
        return { luhn: { message: 'Número inválido. Confira os dígitos do cartão.' } };
      }

      const sum = [...digits]
        .reverse()
        .reduce((acc, char, idx) => {
          let digit = +char;
          if (idx % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          return acc + digit;
        }, 0);

      return sum % 10 === 0 ? null : { luhn: { message: 'Número inválido. Confira os dígitos do cartão.' } };
    };
  }

  static expiration(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return { required: true };

      const match = value.match(/^(0[1-9]|1[0-2])\/?(\d{2}|\d{4})$/);
      if (!match) return { expiration: { message: 'Formato deve ser MM/AA' } };

      const month = +match[1];
      const year = +match[2] + (match[2].length === 2 ? 2000 : 0);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return { expired: { message: 'Cartão vencido.' } };
      }

      if (year > currentYear + 25) {
        return { expiration: { message: 'Data de validade muito distante' } };
      }

      return null;
    };
  }

  static cvv(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return { required: true };

      return /^\d{3,4}$/.test(value) ? null : { cvv: { message: 'Use 3 ou 4 dígitos.' } };
    };
  }

  static cardHolder(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return { required: true };

      if (!value.includes(' ')) {
        return { cardHolder: { message: 'Informe o nome como aparece no cartão.' } };
      }

      if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return { cardHolder: { message: 'Informe o nome como aparece no cartão.' } };
      }

      return null;
    };
  }
}
