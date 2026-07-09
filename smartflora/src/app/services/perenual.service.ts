import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environment';

export interface PerenualSpecies {
  id: number;
  commonName: string;
  scientificName: string;
  imageUrl: string;
  requirements?: {
    watering?: string;
    sunlight?: string[];
    careLevel?: string;
    maintenance?: string;
  };
}

interface PerenualSpeciesListResponse {
  data: Array<{
    id: number;
    common_name: string;
    scientific_name: string[];
    default_image: { medium_url?: string; thumbnail?: string; regular_url?: string } | null;
  }>;
}

interface PerenualSpeciesDetailsResponse {
  id: number;
  common_name: string;
  scientific_name: string[];
  // default_image: { medium_url?: string; thumbnail?: string; regular_url?: string } | null;
  watering?: string;
  sunlight?: string[];
  care_level?: string;
  maintenance?: string;
}

const PERENUAL_BASE_URL = 'https://perenual.com/api/v2';

@Injectable({ providedIn: 'root' })
export class PerenualService {
  private readonly http = inject(HttpClient);

  searchSpecies(query: string): Observable<PerenualSpecies[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return of([]);
    }

    return this.http
      .get<PerenualSpeciesListResponse>(`${PERENUAL_BASE_URL}/species-list`, {
        params: { key: environment.perenualApiKey, q: trimmed }
      })
      .pipe(
        map(response =>
          response.data.map(species => ({
            id: species.id,
            commonName: species.common_name,
            scientificName: species.scientific_name?.[0] ?? '',
            imageUrl: species.default_image?.medium_url ?? species.default_image?.thumbnail ?? ''
          }))
        )
      );
  }

  getSpeciesById(id: number): Observable<PerenualSpecies | null> {
    return this.http
      .get<PerenualSpeciesDetailsResponse>(`${PERENUAL_BASE_URL}/species/details/${id}`, {
        params: { key: environment.perenualApiKey }
      })
      .pipe(
        map(response => ({
          id: response.id,
          commonName: response.common_name,
          scientificName: response.scientific_name?.[0] ?? '',
          imageUrl: '', // The API does not provide an image URL in the details endpoint
          requirements: {
            watering: response.watering,
            sunlight: response.sunlight,
            careLevel: response.care_level,
            maintenance: response.maintenance
          }
        }))
      );
  }
}
