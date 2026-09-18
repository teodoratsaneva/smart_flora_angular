import { Component, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatSlideToggleModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css'
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
}
