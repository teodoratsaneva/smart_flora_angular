import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should be invalid when fields are empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('should be valid with a well-formed email and password', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.form.setValue({ email: 'test@example.com', password: 'secret123' });
    expect(fixture.componentInstance.form.valid).toBe(true);
  });

  it('should not submit when the form is invalid', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.form.touched).toBe(true);
  });
});
