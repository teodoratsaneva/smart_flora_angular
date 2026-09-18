import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environment';

export interface PlantSpeciesOption {
  id: string;
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

interface PlantSpeciesApiResponse {
  id: string;
  name: string;
  species: string;
  sunlight: string[];
  watering: string;
  defaultPhotoUrl: string;
  floweringSeason: string;
  soil: string[];
  careLevel: string;
  maintenance: string;
}

function toPlantSpeciesOption(response: PlantSpeciesApiResponse): PlantSpeciesOption {
  return {
    id: response.id,
    commonName: response.name,
    scientificName: response.species,
    imageUrl: response.defaultPhotoUrl,
    requirements: {
      watering: response.watering,
      sunlight: response.sunlight,
      careLevel: response.careLevel,
      maintenance: response.maintenance
    }
  };
}

@Injectable({ providedIn: 'root' })
export class PlantSpeciesService {
  private readonly http = inject(HttpClient);

  searchSpecies(query: string): Observable<PlantSpeciesOption[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return of([]);
    }

    return this.http
      .get<PlantSpeciesApiResponse[]>(`${environment.apiBaseUrl}/PlantSpecies`, {
        params: { search: trimmed }
      })
      .pipe(map(results => results.map(toPlantSpeciesOption)));
  }

  getSpeciesById(id: string): Observable<PlantSpeciesOption | null> {
    return this.http
      .get<PlantSpeciesApiResponse>(`${environment.apiBaseUrl}/PlantSpecies/${id}`)
      .pipe(
        map(toPlantSpeciesOption),
        catchError(() => of(null))
      );
  }
}
