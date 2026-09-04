import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const token = localStorage.getItem('token');

  if (token) {
    // Remove any accidental quotes and whitespace
    const cleanToken = token.replace(/['"]+/g, '').trim();

    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${cleanToken}`
      }
    });

    return next(modifiedReq);
  }

  return next(req);
}