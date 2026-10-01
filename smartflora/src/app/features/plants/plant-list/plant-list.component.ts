import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
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
  private readonly authService = inject(AuthService);
  private readonly myPlantsService = inject(MyPlantsService);

  protected readonly user = this.authService.currentUser;
  protected readonly plants = signal<MyPlantResponse[]>([]);

  protected readonly activePlant = signal<MyPlantResponse | null>(null);

  constructor() {
    this.reloadPlants();
  }

  private reloadPlants(): void {
    this.myPlantsService.getMyPlants().subscribe(plants => this.plants.set(plants));
  }

  protected openAddData(plant: MyPlantResponse): void {
    this.activePlant.set(plant);
  }

  protected closeAddData(): void {
    this.activePlant.set(null);
    this.reloadPlants();
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

  protected statusTier(plant: MyPlantResponse): 'good' | 'warning' | 'critical' | null {
    const score = plant.careAdviceScore;

    if (score === null) {
      return null;
    }

    if (score >= 80) {
      return 'good';
    }

    if (score >= 40) {
      return 'warning';
    }

    return 'critical';
  }

  protected statusIcon(tier: 'good' | 'warning' | 'critical'): string {
    return tier === 'good' ? '✅' : tier === 'warning' ? '⚠️' : '⛔';
  }
}
