import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { PlantListComponent } from './plant-list.component';

describe('PlantListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantListComponent],
      providers: [
        {
          provide: Auth,
          useValue: {
            onAuthStateChanged: (next: (user: unknown) => void) => {
              next(null);
              return () => {};
            }
          }
        },
        { provide: Firestore, useValue: {} },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PlantListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default to an empty plant list when logged out', () => {
    const fixture = TestBed.createComponent(PlantListComponent);
    expect(fixture.componentInstance['plants']()).toEqual([]);
  });
});
