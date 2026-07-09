import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { PerenualService } from './perenual.service';

describe('PerenualService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should return an empty list without hitting the network for a blank query', async () => {
    const service = TestBed.inject(PerenualService);
    const result = await firstValueFrom(service.searchSpecies('   '));
    expect(result).toEqual([]);
  });

  it('should map the species-list response into PerenualSpecies', async () => {
    const service = TestBed.inject(PerenualService);
    const resultPromise = firstValueFrom(service.searchSpecies('fic'));

    const req = httpMock.expectOne(request => request.url === 'https://perenual.com/api/v2/species-list');
    req.flush({
      data: [
        {
          id: 1,
          common_name: 'Ficus',
          scientific_name: ['Ficus benjamina'],
          default_image: { medium_url: 'https://example.com/ficus.jpg' }
        }
      ]
    });

    const result = await resultPromise;
    expect(result).toEqual([
      { id: 1, commonName: 'Ficus', scientificName: 'Ficus benjamina', imageUrl: 'https://example.com/ficus.jpg' }
    ]);
  });
});
