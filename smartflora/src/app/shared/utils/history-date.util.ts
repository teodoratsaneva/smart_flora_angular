import { Timestamp } from '@angular/fire/firestore';
import { HistoryEntry } from '../../models/plant.model';

export function historyDate(entry: HistoryEntry): Date {
  return entry.date instanceof Timestamp ? entry.date.toDate() : new Date(entry.date);
}
