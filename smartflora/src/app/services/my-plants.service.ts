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

export interface MyPlantResponse {
  id: string;
  userId: string;
  plantSpeciesId: string;
  imgUrl: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MyPlantsService {
  private readonly http = inject(HttpClient);

  createMyPlant(request: CreateMyPlantRequest): Observable<MyPlantResponse> {
    return this.http.post<MyPlantResponse>(`${environment.apiBaseUrl}/MyPlants`, request);
  }

  addHistoryEntry(myPlantId: string, request: CreateHistoryEntryRequest): Observable<unknown> {
    return this.http.post(`${environment.apiBaseUrl}/MyPlants/${myPlantId}/history`, request);
  }
}
