import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlantAddComponent } from './plant-add.component';

describe('PlantAddComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantAddComponent, HttpClientTestingModule],
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
        { provide: Storage, useValue: {} },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PlantAddComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should be invalid until a species is selected', () => {
    const fixture = TestBed.createComponent(PlantAddComponent);
    expect(fixture.componentInstance.isFormValid()).toBe(false);
  });

  it('should become valid once a species is selected', () => {
    const fixture = TestBed.createComponent(PlantAddComponent);
    fixture.componentInstance.selectSpecies({
      id: 1,
      commonName: 'Ficus',
      scientificName: 'Ficus benjamina',
      imageUrl: 'https://example.com/ficus.jpg'
    });
    expect(fixture.componentInstance.isFormValid()).toBe(true);
  });
});
