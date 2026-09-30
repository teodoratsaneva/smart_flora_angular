import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

export interface CreateMyPlantRequest {
  userId: string;
  plantSpeciesId: string;
  imgUrl: string;
  createdAt: string;
}

export interface CreateHistoryEntryRequest {
  myPlantId: string;
  date: string;
  temperature: number;
  soilMoisture: number;
  watered: boolean;
}

export interface PlantSpeciesSummary {
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

export interface MyPlantHistoryEntry {
  id: string;
  myPlantId: string;
  date: string;
  temperature: number;
  soilMoisture: number;
  watered: boolean;
}

export interface MyPlantResponse {
  id: string;
  userId: string;
  plantSpeciesId: string;
  plantSpecies: PlantSpeciesSummary | null;
  imgUrl: string;
  createdAt: string;
  history: MyPlantHistoryEntry[];
}

@Injectable({ providedIn: 'root' })
export class MyPlantsService {
  private readonly http = inject(HttpClient);

  getMyPlants(): Observable<MyPlantResponse[]> {
    return this.http.get<MyPlantResponse[]>(`${environment.apiBaseUrl}/MyPlants`);
  }

  getMyPlantById(id: string): Observable<MyPlantResponse> {
    return this.http.get<MyPlantResponse>(`${environment.apiBaseUrl}/MyPlants/${id}`);
  }

  createMyPlant(request: CreateMyPlantRequest): Observable<MyPlantResponse> {
    return this.http.post<MyPlantResponse>(`${environment.apiBaseUrl}/MyPlants`, request);
  }

  addHistoryEntry(myPlantId: string, request: CreateHistoryEntryRequest): Observable<MyPlantHistoryEntry> {
    return this.http.post<MyPlantHistoryEntry>(`${environment.apiBaseUrl}/MyPlants/${myPlantId}/history`, request);
  }
}
