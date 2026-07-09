export interface Plant {
    id: string;
    name: string;
    variety: string;
    requirements?: {
        watering?: string;
        sunlight?: string;
        careLevel?: string;
        maintenance?: string;
    };
    imgUrl?: string;
    createdAt: Date;
}

export interface PlantEntry {
    id?: string;
    plantId: string;
    date: Date;
    temperature: number;
    soilMoisture: number;
    watered: boolean;
}

export interface AIAnalysis {
    score: number;
    status: 'Healthy' | 'Stable' | 'Marginal' | 'Critical';
    advice: string;
}