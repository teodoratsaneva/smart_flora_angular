import { Component, effect, inject, input, output, signal } from "@angular/core";
import { PlantService } from "../../../services/plant.service";
import { Plant } from "../../../models/plant.model";
import { User } from "@angular/fire/auth";


@Component({
    selector: "app-add-data-plant",
    templateUrl: "./add-data-plant.component.html",
    styleUrls: ["./add-data-plant.component.css"]
})
export class AddDataPlantComponent {
    plantService = inject(PlantService);
    plant = input<Plant | null>(null);
    user = input<User | null | undefined>();
    closed = output<void>();

    protected readonly temperature = signal(20);
    protected readonly soilMoisture = signal(50);
    protected readonly watered = signal(false);
    protected readonly saving = signal(false);
    protected readonly errorMessage = signal<string | null>(null);
    protected readonly toastMessage = signal<string | null>(null);

    constructor() {
        effect(() => {
            if (this.plant()) {
                this.temperature.set(20);
                this.soilMoisture.set(50);
                this.watered.set(false);
                this.errorMessage.set(null);
            }
        });
    }

    closeAddData(): void {
        this.closed.emit();
    }

    async saveEntry(): Promise<void> {
        const plant = this.plant();
        const user = this.user();
        if (!plant || !user) {
            return;
        }

        this.saving.set(true);
        this.errorMessage.set(null);

        try {
            await this.plantService.addPlantData(user.uid, plant.id, {
                temperature: this.temperature(),
                soilMoisture: this.soilMoisture(),
                watered: this.watered()
            });

            this.showToast('Data saved successfully!');
            this.closeAddData();
        } catch (error) {
            if (error instanceof Error && error.message === 'ALREADY_ENTERED_TODAY') {
                this.showToast('You already entered data for this plant today.');

            } else {
                this.errorMessage.set('Failed to save data. Please try again.');
            }
        } finally {
            this.saving.set(false);
        }
    }

    private showToast(message: string): void {
        this.toastMessage.set(message);
        setTimeout(() => this.toastMessage.set(null), 2500);
    }
}
