import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  addDoc,
  collection,
  collectionData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Plant } from '../models/plant.model';

@Injectable({ providedIn: 'root' })
export class PlantService {
  private readonly firestore = inject(Firestore);

  getPlants(userId: string): Observable<Plant[]> {
    return collectionData(this.plantsCollection(userId), { idField: 'id' });
  }

  addPlant(userId: string, plant: Omit<Plant, 'id'>): Promise<void> {
    return addDoc(this.plantsCollection(userId), plant).then(() => undefined);
  }

  private plantsCollection(userId: string): CollectionReference<Plant> {
    return collection(this.firestore, `users/${userId}/plants`) as CollectionReference<Plant>;
  }
}
