import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  addDoc,
  collection,
  collectionData
} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Plant } from '../models/plant.model';

@Injectable({ providedIn: 'root' })
export class PlantService {
  private readonly firestore = inject(Firestore);
  private readonly storage = inject(Storage);

  getPlants(userId: string): Observable<Plant[]> {
    return collectionData(this.plantsCollection(userId), { idField: 'id' });
  }

  addPlant(userId: string, plant: Omit<Plant, 'id'>): Promise<void> {
    return addDoc(this.plantsCollection(userId), plant).then(() => undefined);
  }

  async uploadPlantPhoto(userId: string, file: File): Promise<string> {
    const photoRef = ref(this.storage, `users/${userId}/plants/${Date.now()}-${file.name}`);

    await uploadBytes(photoRef, file);
    
    return getDownloadURL(photoRef);
  }

  private plantsCollection(userId: string): CollectionReference<Plant> {
    return collection(this.firestore, `users/${userId}/plants`) as CollectionReference<Plant>;
  }
}
