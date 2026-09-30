import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlantListComponent } from './plant-list.component';

describe('PlantListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantListComponent, HttpClientTestingModule],
      providers: [
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
