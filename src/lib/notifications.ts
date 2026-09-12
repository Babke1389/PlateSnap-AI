import Constants from 'expo-constants';
import { Platform } from 'react-native';

const IS_EXPO_GO = Constants.appOwnership === 'expo';

/**
 * expo-notifications throws immediately when touched on Android inside Expo Go
 * (SDK 53+ removed that functionality there entirely, not just remote push,
 * despite what the docs suggest) — a real device build (EAS) is required.
 * We guard every entry point below and never `require()` the native module in
 * that environment, since even loading it is what throws.
 */
export const notificationsSupported = !(IS_EXPO_GO && Platform.OS === 'android');

function getNotifications() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('expo-notifications') as typeof import('expo-notifications');
}

let handlerReady = false;
function ensureHandler() {
  if (handlerReady) return;
  const Notifications = getNotifications();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  handlerReady = true;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  ensureHandler();
  const Notifications = getNotifications();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Schedules a daily-repeating local reminder at hour:minute. Returns the notification id. */
export async function scheduleDailyReminder(
  label: string,
  hour: number,
  minute: number
): Promise<string> {
  if (!notificationsSupported) {
    throw new Error(
      "Reminders need a real app build to work on Android — they can't run inside Expo Go here yet."
    );
  }
  ensureHandler();
  const Notifications = getNotifications();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Platesnap AI', body: label },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: 'reminders',
    },
  });
}

export async function cancelReminder(notificationId: string): Promise<void> {
  if (!notificationsSupported) return;
  try {
    const Notifications = getNotifications();
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // already gone — nothing to clean up
  }
}
