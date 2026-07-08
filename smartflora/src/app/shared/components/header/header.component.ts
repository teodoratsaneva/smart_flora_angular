import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [ThemeToggleComponent]
})
export class HeaderComponent {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly showInfo = signal(false);

  toggleInfo(): void {
    this.showInfo.update(value => !value);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    await this.router.navigateByUrl('/login');
  }
}
