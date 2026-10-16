import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PaymentMethodsComponent } from './payment-methods.component';

describe('PaymentMethodsComponent', () => {
  let component: PaymentMethodsComponent;
  let fixture: ComponentFixture<PaymentMethodsComponent>;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PaymentMethodsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentMethodsComponent);
    component = fixture.componentInstance;
    component.product = {
      id: 'nexo-pro',
      name: 'Nexo Pro',
      price: 79.9,
      currency: 'BRL',
      summary: 'Resumo',
      features: ['Feature 1'],
      renewalText: 'Mensal'
    };
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch payment method', () => {
    component.selectMethod('pix');
    expect(component.selectedMethod()).toBe('pix');

    component.selectMethod('debit');
    expect(component.selectedMethod()).toBe('debit');
  });

  it('should mark form as touched and not emit if card form is invalid', () => {
    let emitted = false;
    component.paymentSubmit.subscribe(() => {
      emitted = true;
    });

    component.selectMethod('credit');
    component.cardForm.patchValue({
      number: '',
      holderName: ''
    });

    component.onSubmit();
    expect(emitted).toBe(false);
    expect(component.cardForm.invalid).toBe(true);
  });

  it('should emit paymentSubmit when form is valid', () => {
    let emittedData: any = null;
    component.paymentSubmit.subscribe((data) => {
      emittedData = data;
    });

    component.selectMethod('pix');
    component.onSubmit();

    expect(emittedData).toBeTruthy();
    expect(emittedData.method).toBe('pix');
  });
});
