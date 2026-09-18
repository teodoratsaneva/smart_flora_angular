import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../environment";
import { Plant } from "../models/plant.model";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=";

interface GeminiGenerateContentResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
}

@Injectable({providedIn: 'root'})
export class GeminiService {
    private readonly http = inject(HttpClient);

    generateContent(prompt: string): Observable<string> {
        const url = `${GEMINI_BASE_URL}${environment.geminiApiKey}`;
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 }
            }
        };

        return this.http.post<GeminiGenerateContentResponse>(url, body).pipe(
            map(response => response.candidates?.[0]?.content?.parts?.[0]?.text ?? '')
        );
    }

    getCareAdvice(plant: Plant): Observable<string> {
        const prompt = `
            You are a professional botanist. 
            Analyze the following plant care history for the last 7 days and compare it strictly with the ideal parameters provided.
            Plant: ${plant.name} ${plant.variety}
            Care History (found in the last 7 days):
            ${plant.history?.map(entry =>
                `Date: ${entry.date}
                 Soil Humidity: ${entry.soilMoisture}
                 Soil Temperature: ${entry.temperature}
                 Watered: ${entry.watered ? 'Yes' : 'No'}`
            ).join('\n')
            }
            Ideal Parameters:
            Watering: ${plant.requirements?.watering || 'Not specified'}
            Sunlight: ${plant.requirements?.sunlight || 'Not specified'}
            Care Level: ${plant.requirements?.careLevel || 'Not specified'}
            Maintenance: ${plant.requirements?.maintenance || 'Not specified'}

            SCORING RULES:
                - Start with 100 points.
                - Deduct 10 points for every missing day of data in the last 7 days (uncertainty penalty).
                - Deduct points for each day where soil humidity or temperature is outside the ideal range.
                - Deduct significant points (20-30) if the plant hasn't been watered when the soil was dry.
                - If you give advice to "change something" or "fix a problem", the score MUST be below 80.
                - If there is a critical survival risk, the score MUST be below 40.
                - Be strict. 70% is NOT a "passing" grade for a dying plant.
                - If there are fewer than 3 records in total, the score MUST NOT exceed 50.
            
                Return ONLY a valid JSON object with the following structure:
                {
                  "score": (integer 0-100, reflecting the physical health and care quality),
                  "status": (short string, e.g., "Excellent", "Stressed", "Critical", "Dry"),
                  "advice": (string, max 2 sentences, focused on the most urgent action)
                }
        `;

        console.log("Prompt sent to Gemini API:", prompt);

        return this.generateContent(prompt);
    }
}