import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { AmplifyService } from '../services/amplify.service';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private amplifyService: AmplifyService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip GraphQL requests (handled by Apollo)
    if (req.url.includes('appsync') || req.url.includes('graphql')) {
      return next.handle(req);
    }
    
    // Add auth token to other API requests
    return from(this.amplifyService.getAuthSession()).pipe(
      switchMap(session => {
        if (session?.tokens?.idToken) {
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${session.tokens.idToken.toString()}`
            }
          });
          return next.handle(authReq);
        }
        return next.handle(req);
      })
    );
  }
} 