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
    fixture.componentRef.setInput('product', {
      id: 'nexo-pro',
      name: 'Nexo Pro',
      price: 79.9,
      currency: 'BRL',
      billingPeriod: 'Plano mensal',
      usersCount: 1,
      summary: 'Resumo',
      features: ['Acesso a todos recursos', 'Relatórios e automações'],
      renewalText: 'Renovação mensal.'
    });
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should pluralize user count correctly using computed signal', () => {
    expect(component.userCountText()).toBe('1 usuário');
    expect(fixture.nativeElement.textContent).toContain('1 usuário');

    fixture.componentRef.setInput('product', {
      ...component.product()!,
      usersCount: 3
    });
    fixture.detectChanges();

    expect(component.userCountText()).toBe('3 usuários');
    expect(fixture.nativeElement.textContent).toContain('3 usuários');
  });

  it('should render both mobile and desktop views with responsive classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.order-summary-mobile')).toBeTruthy();
    expect(element.querySelector('.order-summary-desktop')).toBeTruthy();
  });
});
