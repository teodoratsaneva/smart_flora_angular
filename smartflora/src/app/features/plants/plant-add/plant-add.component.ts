import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, firstValueFrom, of, switchMap } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { PlantService } from '../../../services/plant.service';
import { PlantSpeciesService, PlantSpeciesOption } from '../../../services/plant-species.service';
import { MyPlantsService } from '../../../services/my-plants.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-plant-add',
  imports: [FormsModule, ReactiveFormsModule, RouterLink, HeaderComponent],
  templateUrl: './plant-add.component.html',
  styleUrl: './plant-add.component.css'
})
export class PlantAddComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly plantService = inject(PlantService);
  private readonly plantSpeciesService = inject(PlantSpeciesService);
  private readonly myPlantsService = inject(MyPlantsService);

  protected readonly searchControl = this.fb.nonNullable.control('');

  protected readonly searchResults = signal<PlantSpeciesOption[]>([]);

  protected readonly selectedSpecies = signal<PlantSpeciesOption | null>(null);
  protected readonly selectedPhoto = signal<File | null>(null);
  protected readonly photoPreviewUrl = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => (this.selectedSpecies()?.commonName === query ? of([]) : this.plantSpeciesService.searchSpecies(query))),
        takeUntilDestroyed()
      )
      .subscribe(results => this.searchResults.set(results));
  }

  selectSpecies(species: PlantSpeciesOption): void {
    this.selectedSpecies.set(species);
    this.searchResults.set([]);
    this.searchControl.setValue(species.commonName, { emitEvent: false });
    if (!this.selectedPhoto()) {
      this.photoPreviewUrl.set(species.imageUrl || null);
    }

    this.plantSpeciesService.getSpeciesById(species.id).subscribe(details => {
      if (details && this.selectedSpecies()?.id === species.id) {
        this.selectedSpecies.set({ ...species, ...details });
      }
    });

    console.log(this.selectedSpecies());
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedPhoto.set(file);

    if (!file) {
      this.photoPreviewUrl.set(this.selectedSpecies()?.imageUrl || null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.photoPreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  isFormValid(): boolean {
    return this.selectedSpecies() !== null;
  }

  async onSubmit(): Promise<void> {
    const species = this.selectedSpecies();
    if (!species) {
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    try {
      const photo = this.selectedPhoto();
      const imgUrl = photo ? await this.plantService.uploadPlantPhoto(photo) : species.imageUrl;

      await firstValueFrom(
        this.myPlantsService.createMyPlant({
          userId: user.id,
          plantSpeciesId: species.id,
          imgUrl,
          createdAt: new Date().toISOString()
        })
      );
    } catch (error) {
      console.error('[plant-add] Failed to save plant:', error);
      this.errorMessage.set('Failed to save the plant. Please try again.');
      this.saving.set(false);
      return;
    }

    this.saving.set(false);
    await this.router.navigateByUrl('/plants').catch(() => {});
  }
}
