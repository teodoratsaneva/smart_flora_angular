import { DatePipe } from '@angular/common';
import { Component, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState } from '@angular/fire/auth';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { MyPlantHistoryEntry, MyPlantResponse, MyPlantsService } from '../../../services/my-plants.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { TrendChartComponent } from '../trend-chart/trend-chart.component';
import { GeminiService } from '../../../services/gemini.service';

@Component({
  selector: 'app-plant-details',
  imports: [HeaderComponent, RouterLink, DatePipe, TrendChartComponent],
  templateUrl: './plant-details.component.html',
  styleUrl: './plant-details.component.css'
})
export class PlantDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(Auth);
  private readonly myPlantsService = inject(MyPlantsService);

  private readonly geminiService = inject(GeminiService);

  protected readonly user = toSignal(authState(this.auth));
  protected readonly minHistoryForAdvice = 3;

  careAdvice = signal<{ score: number; status: string; advice: string } | null>(null);
  lastAdviceHistoryLength = signal<number | null>(null);

  protected readonly plant = toSignal(
    authState(this.auth).pipe(
      switchMap(user => {
        const id = this.route.snapshot.paramMap.get('id');

        return user && id ? this.myPlantsService.getMyPlantById(id) : of(undefined);
      })
    ),
    { initialValue: undefined }
  );

  constructor() {

    effect(() => {
      const plant = this.plant();
      const historyLength = plant?.history?.length ?? 0;

      if (plant && historyLength >= this.minHistoryForAdvice && this.lastAdviceHistoryLength() !== historyLength) {
        this.lastAdviceHistoryLength.set(historyLength);
        this.getCareAdvice(plant);
      }
    });
  }

  protected entryDate(entry: MyPlantHistoryEntry): Date {
    return new Date(entry.date);
  }

  protected sortedHistory(): MyPlantHistoryEntry[] {
    const history = this.plant()?.history ?? [];

    return [...history].sort((a, b) => this.entryDate(b).getTime() - this.entryDate(a).getTime());
  }

  getCareAdvice(plant: MyPlantResponse): void {
    this.geminiService.getCareAdvice(plant).subscribe({
      next: advice => {
        try {
          const parsedAdvice = JSON.parse(advice);
          this.careAdvice.set(parsedAdvice);
          this.lastAdviceHistoryLength.set(plant.history?.length ?? 0);
        } catch (error) {
          console.error('Error parsing advice:', error);
          alert('Error parsing advice. Please check the console for details.');
        }
      },
      error: error => {
        console.error('Error fetching care advice:', error);
        alert('Error fetching care advice. Please check the console for details.');
      }
    });
  }
}
