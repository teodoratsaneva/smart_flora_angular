import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
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
        }
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PlantListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
