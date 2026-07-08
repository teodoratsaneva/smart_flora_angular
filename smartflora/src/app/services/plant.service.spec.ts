import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { PlantService } from './plant.service';

describe('PlantService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Firestore, useValue: {} }]
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(PlantService);
    expect(service).toBeTruthy();
  });
});
