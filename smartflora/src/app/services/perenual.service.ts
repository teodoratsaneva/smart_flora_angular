import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environment';

export interface PerenualSpecies {
  id: number;
  commonName: string;
  scientificName: string;
  imageUrl: string;
}

interface PerenualSpeciesListResponse {
  data: Array<{
    id: number;
    common_name: string;
    scientific_name: string[];
    default_image: { medium_url?: string; thumbnail?: string; regular_url?: string } | null;
  }>;
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
}
