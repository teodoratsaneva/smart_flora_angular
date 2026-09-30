import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';
import { MyPlantResponse, MyPlantsService } from '../../../services/my-plants.service';
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
  private readonly myPlantsService = inject(MyPlantsService);

  protected readonly user = toSignal(authState(this.auth));
  protected readonly plants = signal<MyPlantResponse[]>([]);

  protected readonly activePlant = signal<MyPlantResponse | null>(null);

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        this.loadPlants(user.uid);
      } else {
        this.plants.set([]);
      }
    });
  }

  private loadPlants(userId: string): void {
    this.myPlantsService.getMyPlants(userId).subscribe(plants => this.plants.set(plants));
  }

  protected openAddData(plant: MyPlantResponse): void {
    this.activePlant.set(plant);
  }

  protected closeAddData(): void {
    this.activePlant.set(null);

    const user = this.user();
    if (user) {
      this.loadPlants(user.uid);
    }
  }

  isDataEnteredToday(plant: MyPlantResponse): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const history = plant.history ?? [];
    return history.some(entry => new Date(entry.date) >= today);
  }

  tooltipMessage(plant: MyPlantResponse) {
    return this.isDataEnteredToday(plant) ? 'You have already entered data for this plant today.' : '';
  }
}
