import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Meal, WeightEntry } from './types';

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function mealsToCsv(meals: Meal[]): string {
  const header = 'date,description,calories,protein_g,carbs_g,fat_g,source';
  const rows = meals
    .slice()
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .map((m) =>
      [m.dateISO, m.description, m.calories, m.proteinG, m.carbsG, m.fatG, m.source]
        .map(csvEscape)
        .join(',')
    );
  return [header, ...rows].join('\n');
}

function weightToCsv(entries: WeightEntry[]): string {
  const header = 'date,weight_kg';
  const rows = entries
    .slice()
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .map((w) => [w.dateISO, w.weightKg].map(csvEscape).join(','));
  return [header, ...rows].join('\n');
}

export async function exportDataAsCsv(meals: Meal[], weightLog: WeightEntry[]): Promise<void> {
  const combined = `Meals\n${mealsToCsv(meals)}\n\nWeight log\n${weightToCsv(weightLog)}\n`;

  const file = new File(Paths.cache, 'platesnap-ai-export.csv');
  if (file.exists) file.delete();
  file.create();
  file.write(combined);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing isn\'t available on this device.');
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export Platesnap AI data' });
}
