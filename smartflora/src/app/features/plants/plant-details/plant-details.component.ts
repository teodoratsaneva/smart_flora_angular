import { DatePipe } from '@angular/common';
import { Component, Injector, inject, runInInjectionContext, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState } from '@angular/fire/auth';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { PlantService } from '../../../services/plant.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { historyDate } from '../../../shared/utils/history-date.util';
import { TrendChartComponent } from '../trend-chart/trend-chart.component';
import { GeminiService } from '../../../services/gemini.service';
import { HistoryEntry, Plant } from '../../../models/plant.model';

@Component({
  selector: 'app-plant-details',
  imports: [HeaderComponent, RouterLink, DatePipe, TrendChartComponent],
  templateUrl: './plant-details.component.html',
  styleUrl: './plant-details.component.css'
})
export class PlantDetailsComponent {
  protected readonly historyDate = historyDate;

  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(Auth);
  private readonly plantService = inject(PlantService);
  private readonly injector = inject(Injector);

  private readonly geminiService = inject(GeminiService);

  protected readonly user = toSignal(authState(this.auth));

  careAdvice = signal<{ score: number; status: string; advice: string } | null>(null);
  lastAdviceHistoryLength = signal<number | null>(null);
  protected readonly minHistoryForAdvice = 3;

  protected readonly plant = toSignal(
    authState(this.auth).pipe(
      switchMap(user => {
        const id = this.route.snapshot.paramMap.get('id');

        return user && id
          ? runInInjectionContext(this.injector, () => this.plantService.getPlant(user.uid, id))
          : of(undefined);
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

  protected sortedHistory(): HistoryEntry[] {
    const history = this.plant()?.history ?? [];

    return [...history].sort((a, b) => historyDate(b).getTime() - historyDate(a).getTime());
  }

    getCareAdvice(plant: Plant): void {
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
