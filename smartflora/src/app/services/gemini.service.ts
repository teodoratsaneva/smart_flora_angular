import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../environment";
import { MyPlantResponse } from "./my-plants.service";

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

    getCareAdvice(plant: MyPlantResponse): Observable<string> {
        const species = plant.plantSpecies;
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const prompt = `
            You are a professional botanist.
            Analyze the following plant care history for the last 7 days and compare it strictly with the ideal parameters provided.
            Plant: ${species?.name ?? 'Unknown'} ${species?.species ?? ''}
            Care History (found in the last 7 days):
            ${plant.history?.map(entry =>
                `Date: ${entry.date}
                 Soil Humidity: ${entry.soilMoisture}
                 Soil Temperature: ${entry.temperature}
                 Watered: ${entry.watered ? 'Yes' : 'No'}`
            ).join('\n')
            }
            Ideal Parameters:
            Watering: ${species?.watering || 'Not specified'}
            Sunlight: ${species?.sunlight?.join(', ') || 'Not specified'}
            Care Level: ${species?.careLevel || 'Not specified'}
            Maintenance: ${species?.maintenance || 'Not specified'}

            SCORING RULES:
                - Start with 100 points.
                - Deduct 10 points for every missing day of data in the last 7 days (uncertainty penalty).
                - Deduct points for each day where soil humidity or temperature is outside the ideal range.
                - Deduct significant points (20-30) if the plant hasn't been watered when the soil was dry.
                - If you give advice to "change something" or "fix a problem", the score MUST be below 80.
                - If there is a critical survival risk, the score MUST be below 40.
                - Be strict. 70% is NOT a "passing" grade for a dying plant.
                - If there are fewer than 3 records in total, the score MUST NOT exceed 50.
            
                ADVICE REQUIREMENTS:
                - The "advice" field MUST start exactly with "As of ${today}, the plant " followed by a brief health summary sentence.
                - After that, it MUST include one concrete, actionable recommendation with specific timing whenever relevant — e.g. "Water it in 2 days.", "Consider repotting in early spring, since the soil has been compacted for weeks.", "Move it to a spot with more indirect light within the next few days."
                - Base the recommendation on the gap between the actual care history and the ideal parameters, not generic advice.
                - Maximum 3 sentences total.

                Return ONLY a valid JSON object with the following structure:
                {
                  "score": (integer 0-100, reflecting the physical health and care quality),
                  "status": (short string, e.g., "Excellent", "Stressed", "Critical", "Dry"),
                  "advice": (string, see ADVICE REQUIREMENTS above)
                }
        `;

        return this.generateContent(prompt);
    }
}