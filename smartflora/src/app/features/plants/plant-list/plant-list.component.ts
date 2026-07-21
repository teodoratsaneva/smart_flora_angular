import { Component, Injector, inject, runInInjectionContext, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';
import { RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { Plant } from '../../../models/plant.model';
import { PlantService } from '../../../services/plant.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AddDataPlantComponent } from '../add-data/add-data-plant.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-plant-list',
  imports: [HeaderComponent, RouterLink, AddDataPlantComponent, MatTooltip],
  templateUrl: './plant-list.component.html',
  styleUrl: './plant-list.component.css'
})
export class PlantListComponent {
  private readonly auth = inject(Auth);
  private readonly plantService = inject(PlantService);
  private readonly injector = inject(Injector);

  protected readonly user = toSignal(authState(this.auth));

  protected readonly plants = toSignal(
    authState(this.auth).pipe(
      switchMap(user =>
        user
          ? runInInjectionContext(this.injector, () => this.plantService.getPlants(user.uid))
          : of([])
      )
    ),
    { initialValue: [] }
  );

  protected readonly activePlant = signal<Plant | null>(null);

  protected openAddData(plant: Plant): void {
    this.activePlant.set(plant);
  }

  protected closeAddData(): void {
    this.activePlant.set(null);
  }

  isDataEnteredToday(plant: Plant): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const history = plant.history ?? [];
    const alreadyEnteredToday = history.some(entry => {
      const entryDate = entry.date instanceof Timestamp ? entry.date.toDate() : new Date(entry.date);
      return entryDate >= today;
    });

    return alreadyEnteredToday;
  }

  tooltipMessage(plant: Plant) {
    return this.isDataEnteredToday(plant) ? 'You have already entered data for this plant today.' : '';
  }
}
