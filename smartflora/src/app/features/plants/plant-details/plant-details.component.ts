import { DatePipe } from '@angular/common';
import { Component, Injector, inject, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState } from '@angular/fire/auth';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { HistoryEntry } from '../../../models/plant.model';
import { PlantService } from '../../../services/plant.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { historyDate } from '../../../shared/utils/history-date.util';
import { TrendChartComponent } from '../trend-chart/trend-chart.component';

@Component({
  selector: 'app-plant-details',
  imports: [HeaderComponent, RouterLink, DatePipe, TrendChartComponent],
  templateUrl: './plant-details.component.html',
  styleUrl: './plant-details.component.css'
})
export class PlantDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(Auth);
  private readonly plantService = inject(PlantService);
  private readonly injector = inject(Injector);

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

  protected historyDate(entry: HistoryEntry): Date {
    return historyDate(entry);
  }

  protected sortedHistory(): HistoryEntry[] {
    const history = this.plant()?.history ?? [];

    return [...history].sort((a, b) => historyDate(b).getTime() - historyDate(a).getTime());
  }
}
