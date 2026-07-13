import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  doc,
  getDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { HistoryEntry, Plant } from '../models/plant.model';

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

  async addPlantData(userId: string, plantId: string, data: { temperature: number; soilMoisture: number; watered: boolean }): Promise<void> {
    const plantRef = this.plantDoc(userId, plantId);
    const plantSnapshot = await getDoc(plantRef);
    const history = (plantSnapshot.data()?.history ?? []) as HistoryEntry[];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyEnteredToday = history.some(entry => {
      const entryDate = entry.date instanceof Timestamp ? entry.date.toDate() : new Date(entry.date);
      return entryDate >= today;
    });

    if (alreadyEnteredToday) {
      throw new Error('ALREADY_ENTERED_TODAY');
    }

    await updateDoc(plantRef, {
      history: arrayUnion({
        ...data,
        date: new Date()
      })
    });
  }

  private plantsCollection(userId: string): CollectionReference<Plant> {
    return collection(this.firestore, `users/${userId}/plants`) as CollectionReference<Plant>;
  }

  private plantDoc(userId: string, plantId: string): DocumentReference<Plant> {
    return doc(this.firestore, `users/${userId}/plants/${plantId}`) as DocumentReference<Plant>;
  }
}
