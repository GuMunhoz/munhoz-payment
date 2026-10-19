import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, mergeMap, of, throwError, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaymentRequest, PaymentSuccessResponse, Product } from '../../models/payment.models';
import { handleMockPayment } from '../../../mocks/mock-payment.handler';
import { MOCK_PRODUCT_NEXO_PRO } from '../../../mocks/mock-products';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getProduct(id: string = 'nexo-pro'): Observable<Product> {
    if (environment.useMock) {
      return of(MOCK_PRODUCT_NEXO_PRO).pipe(delay(400));
    }
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  processPayment(request: PaymentRequest): Observable<PaymentSuccessResponse> {
    if (environment.useMock) {
      const outcome = handleMockPayment(request, MOCK_PRODUCT_NEXO_PRO.price);

      if (outcome.success) {
        return of(outcome.response).pipe(delay(1200));
      } else {
        return timer(1200).pipe(
          mergeMap(() =>
            throwError(
              () =>
                new HttpErrorResponse({
                  status: 402,
                  statusText: 'Payment Required',
                  error: outcome.error
                })
            )
          )
        );
      }
    }

    return this.http.post<PaymentSuccessResponse>(`${this.apiUrl}/payments`, request);
  }
}
