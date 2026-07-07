export interface Plant {
    id: string;
    name: string;
    variety: string;
    idealTemperature: number;
    idealHumidity: number;
    imgUrl: string;
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