import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
  });

  it('should default to the light theme when nothing is stored', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
  });

  it('should toggle between light and dark', () => {
    const service = TestBed.inject(ThemeService);
    const initial = service.theme();
    service.toggle();
    expect(service.theme()).not.toBe(initial);
  });

  it('should reflect the theme on the document element', () => {
    const service = TestBed.inject(ThemeService);
    service.toggle();
    expect(document.documentElement.getAttribute('data-theme')).toBe(service.theme());
  });

  it('should persist the theme to localStorage', () => {
    const service = TestBed.inject(ThemeService);
    service.toggle();
    expect(localStorage.getItem('smartflora-theme')).toBe(service.theme());
  });
});
