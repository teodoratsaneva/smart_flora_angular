import { DatePipe } from '@angular/common';
import { Component, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
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
  private readonly myPlantsService = inject(MyPlantsService);

  private readonly geminiService = inject(GeminiService);

  protected readonly minHistoryForAdvice = 3;

  careAdvice = signal<{ score: number; status: string; advice: string } | null>(null);

  protected readonly plant = toSignal(
    (() => {
      const id = this.route.snapshot.paramMap.get('id');
      return id ? this.myPlantsService.getMyPlantById(id) : of(undefined);
    })(),
    { initialValue: undefined }
  );

  constructor() {
    effect(() => {
      const plant = this.plant();
      if (!plant) {
        return;
      }

      const hasValidPersistedAdvice = !!plant.careAdviceText && plant.careAdviceScore !== null && plant.careAdviceStatus !== null;

      if (hasValidPersistedAdvice) {
        this.careAdvice.set({
          score: plant.careAdviceScore!,
          status: plant.careAdviceStatus!,
          advice: plant.careAdviceText!
        });
      }

      const historyLength = plant.history?.length ?? 0;
      const lastAnalyzedCount = plant.careAdviceHistoryCount ?? 0;

      if (historyLength >= this.minHistoryForAdvice && (!hasValidPersistedAdvice || historyLength > lastAnalyzedCount)) {
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

          if (!parsedAdvice?.advice || typeof parsedAdvice.score !== 'number' || !parsedAdvice.status) {
            throw new Error('Incomplete advice response from Gemini');
          }

          this.careAdvice.set(parsedAdvice);

          this.myPlantsService
            .saveCareAdvice(plant.id, {
              score: parsedAdvice.score,
              status: parsedAdvice.status,
              advice: parsedAdvice.advice
            })
            .subscribe({
              error: saveError => console.error('Failed to persist care advice:', saveError)
            });
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
