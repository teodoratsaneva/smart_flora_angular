import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({ providedIn: 'root' })
export class PlantService {
  private readonly http = inject(HttpClient);

  async uploadPlantPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await firstValueFrom(
      this.http.post<{ url: string }>(`${environment.apiBaseUrl}/Uploads/photo`, formData)
    );

    return response.url;
  }
}
