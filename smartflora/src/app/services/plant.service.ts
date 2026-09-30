import { Injectable, inject } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class PlantService {
  private readonly storage = inject(Storage);

  async uploadPlantPhoto(userId: string, file: File): Promise<string> {
    const photoRef = ref(this.storage, `users/${userId}/plants/${Date.now()}-${file.name}`);

    await uploadBytes(photoRef, file);

    return getDownloadURL(photoRef);
  }
}
