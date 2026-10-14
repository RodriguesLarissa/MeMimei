import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UiButton } from '../../ui/button/button';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'layout-header',
  imports: [RouterLink, UiButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class LayoutHeader {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigateByUrl('/');
  }
}
