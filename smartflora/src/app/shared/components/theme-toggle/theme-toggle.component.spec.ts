import { TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle the theme when clicked', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    const themeService = fixture.componentInstance['themeService'];
    const initial = themeService.theme();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.theme-toggle');
    button.click();

    expect(themeService.theme()).not.toBe(initial);
  });
});
