import { Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-plant-list',
  templateUrl: './plant-list.component.html',
  styleUrl: './plant-list.component.css'
})
export class PlantListComponent {
  private readonly auth = inject(Auth);
  protected readonly user = toSignal(authState(this.auth));
}
