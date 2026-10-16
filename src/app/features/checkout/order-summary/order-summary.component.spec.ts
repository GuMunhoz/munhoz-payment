import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { OrderSummaryComponent } from './order-summary.component';

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent;
  let fixture: ComponentFixture<OrderSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderSummaryComponent);
    component = fixture.componentInstance;
    component.product = {
      id: 'nexo-pro',
      name: 'Nexo Pro',
      price: 79.9,
      currency: 'BRL',
      billingPeriod: 'Plano mensal',
      usersCount: 1,
      summary: 'Resumo',
      features: ['Acesso a todos recursos', 'Relatórios e automações'],
      renewalText: 'Renovação mensal.'
    };
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should pluralize user count correctly', () => {
    expect(component.getUserCountText()).toBe('1 usuário');

    component.product = {
      ...component.product!,
      usersCount: 3
    };
    expect(component.getUserCountText()).toBe('3 usuários');
  });

  it('should render both mobile and desktop views with responsive classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.order-summary-mobile')).toBeTruthy();
    expect(element.querySelector('.order-summary-desktop')).toBeTruthy();
  });
});
