import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should be invalid when fields are empty', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('should be invalid when passwords do not match', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.componentInstance.form.setValue({
      email: 'test@example.com',
      password: 'secret123',
      confirmPassword: 'different'
    });
    expect(fixture.componentInstance.form.errors?.['passwordMismatch']).toBe(true);
  });

  it('should be valid when passwords match', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.componentInstance.form.setValue({
      email: 'test@example.com',
      password: 'secret123',
      confirmPassword: 'secret123'
    });
    expect(fixture.componentInstance.form.valid).toBe(true);
  });
});
