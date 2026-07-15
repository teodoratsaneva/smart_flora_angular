import { Component, computed, input } from '@angular/core';
import { HistoryEntry } from '../../../models/plant.model';
import { historyDate } from '../../../shared/utils/history-date.util';

interface ChartPoint {
  x: number;
  y: number;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 190;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 36;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 30;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const DAYS_SHOWN = 7;

@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.component.html',
  styleUrl: './trend-chart.component.css'
})
export class TrendChartComponent {
  readonly history = input<HistoryEntry[]>([]);

  protected readonly CHART_WIDTH = CHART_WIDTH;
  protected readonly CHART_HEIGHT = CHART_HEIGHT;
  protected readonly PADDING_LEFT = PADDING_LEFT;
  protected readonly PADDING_RIGHT = PADDING_RIGHT;

  protected readonly chart = computed(() => {
    const entryByDay = new Map<string, HistoryEntry>();
    for (const entry of this.history()) {
      entryByDay.set(this.dayKey(historyDate(entry)), entry);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const labels: string[] = [];
    const temperatures: (number | null)[] = [];
    const moistures: (number | null)[] = [];

    for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const entry = entryByDay.get(this.dayKey(date));

      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      temperatures.push(entry ? entry.temperature : null);
      moistures.push(entry ? entry.soilMoisture : null);
    }

    const xs = labels.map((_, i) => PADDING_LEFT + i * (PLOT_WIDTH / (DAYS_SHOWN - 1)));

    return {
      days: labels.map((label, i) => ({ label, x: xs[i] })),
      gridLines: [0, 0.2, 0.4, 0.6, 0.8, 1].map(fraction => ({
        y: PADDING_TOP + (1 - fraction) * PLOT_HEIGHT,
        tempLabel: Math.round(fraction * 30),
        moistureLabel: Math.round(fraction * 100)
      })),
      hasData: temperatures.some(value => value !== null) || moistures.some(value => value !== null),
      tempSegments: this.buildSegments(xs, temperatures, 30),
      moistureSegments: this.buildSegments(xs, moistures, 100),
      tempPoints: this.buildPoints(xs, temperatures, 30),
      moisturePoints: this.buildPoints(xs, moistures, 100)
    };
  });

  private dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  private valueToY(value: number, max: number): number {
    const clamped = Math.min(Math.max(value, 0), max);
    return PADDING_TOP + (1 - clamped / max) * PLOT_HEIGHT;
  }

  private buildSegments(xs: number[], values: (number | null)[], max: number): string[] {
    const segments: string[] = [];
    let current: string[] = [];

    values.forEach((value, i) => {
      if (value === null) {
        if (current.length > 0) {
          segments.push(current.join(' '));
          current = [];
        }
        return;
      }
      current.push(`${xs[i]},${this.valueToY(value, max)}`);
    });

    if (current.length > 0) {
      segments.push(current.join(' '));
    }

    return segments;
  }

  private buildPoints(xs: number[], values: (number | null)[], max: number): ChartPoint[] {
    return values
      .map((value, i) => (value === null ? null : { x: xs[i], y: this.valueToY(value, max) }))
      .filter((point): point is ChartPoint => point !== null);
  }
}
