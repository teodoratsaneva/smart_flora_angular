import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState } from '@angular/fire/auth';
import { of, switchMap } from 'rxjs';
import { PlantService } from '../../../services/plant.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-plant-list',
  imports: [HeaderComponent],
  templateUrl: './plant-list.component.html',
  styleUrl: './plant-list.component.css'
})
export class PlantListComponent {
  private readonly auth = inject(Auth);
  private readonly plantService = inject(PlantService);

  protected readonly user = toSignal(authState(this.auth));

  protected readonly plants = toSignal(
    authState(this.auth).pipe(
      switchMap(user => (user ? this.plantService.getPlants(user.uid) : of([])))
    ),
    { initialValue: [] }
  );
}
