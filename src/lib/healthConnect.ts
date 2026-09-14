import { Platform } from 'react-native';
import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings as hcOpenSettings,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

/**
 * Reads heart rate from Android's Health Connect store — the shared store that
 * Wear OS, Galaxy Watch, Mi Band and most other Android-compatible smartwatches
 * sync into via their own companion apps. There's no direct Bluetooth pairing
 * here; Health Connect is the standard integration point on Android.
 */

export interface HeartRateReading {
  bpm: number;
  time: string;
}

export function isHeartRateTrackingSupported(): boolean {
  return Platform.OS === 'android';
}

export async function isHealthConnectAvailable(): Promise<boolean> {
  if (!isHeartRateTrackingSupported()) return false;
  const status = await getSdkStatus();
  return status === SdkAvailabilityStatus.SDK_AVAILABLE;
}

export async function hasHeartRatePermission(): Promise<boolean> {
  if (!isHeartRateTrackingSupported()) return false;
  try {
    const granted = await getGrantedPermissions();
    return granted.some((p) => p.recordType === 'HeartRate');
  } catch {
    return false;
  }
}

export async function connectHeartRate(): Promise<boolean> {
  if (!isHeartRateTrackingSupported()) {
    throw new Error('Smartwatch heart rate sync needs an Android phone with Health Connect.');
  }
  const available = await isHealthConnectAvailable();
  if (!available) {
    throw new Error(
      "Health Connect isn't available. Install or update the Health Connect app from the Play Store, then try again."
    );
  }
  await initialize();
  const granted = await requestPermission([{ accessType: 'read', recordType: 'HeartRate' }]);
  return granted.some((p) => p.recordType === 'HeartRate');
}

export async function getLatestHeartRate(): Promise<HeartRateReading | null> {
  if (!isHeartRateTrackingSupported()) return null;
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const { records } = await readRecords('HeartRate', {
    timeRangeFilter: {
      operator: 'between',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
  });

  let latest: HeartRateReading | null = null;
  for (const record of records) {
    for (const sample of record.samples) {
      if (!latest || new Date(sample.time).getTime() > new Date(latest.time).getTime()) {
        latest = { bpm: Math.round(sample.beatsPerMinute), time: sample.time };
      }
    }
  }
  return latest;
}

export function openHealthConnectSettings(): void {
  if (!isHeartRateTrackingSupported()) return;
  hcOpenSettings();
}
