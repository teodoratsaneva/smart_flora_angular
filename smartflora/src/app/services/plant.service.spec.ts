import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { PlantService } from './plant.service';

describe('PlantService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: Storage, useValue: {} }
      ]
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(PlantService);
    expect(service).toBeTruthy();
  });
});
