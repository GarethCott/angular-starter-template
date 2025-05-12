import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AmplifyService } from '../services/amplify.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private amplifyService: AmplifyService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  canLoad(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  private checkAuth(): Observable<boolean | UrlTree> {
    return this.amplifyService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        // Redirect to login page if not authenticated
        return this.router.createUrlTree(['/login']);
      })
    );
  }
} 