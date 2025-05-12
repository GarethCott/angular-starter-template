import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AmplifyService } from '../services/amplify.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private amplifyService: AmplifyService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.amplifyService.getCurrentUser().pipe(
      take(1),
      map(user => {
        // Check if user belongs to required group
        const groups = user?.signInUserSession?.accessToken?.payload['cognito:groups'] || [];
        if (groups.includes('admin')) {
          return true;
        }
        // Redirect to unauthorized page if not in required group
        return this.router.createUrlTree(['/unauthorized']);
      })
    );
  }
} 