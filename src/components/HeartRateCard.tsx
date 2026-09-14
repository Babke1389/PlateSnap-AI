import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  connectHeartRate,
  getLatestHeartRate,
  hasHeartRatePermission,
  HeartRateReading,
  isHeartRateTrackingSupported,
  openHealthConnectSettings,
} from '../lib/healthConnect';
import { colors, font, radius, spacing } from '../theme';
import { Button } from './Button';
import { Card } from './Card';

type Status = 'checking' | 'disconnected' | 'connecting' | 'connected';

function minutesAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return `${hours}h ago`;
}

export function HeartRateCard() {
  const [status, setStatus] = useState<Status>('checking');
  const [reading, setReading] = useState<HeartRateReading | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const latest = await getLatestHeartRate();
      setReading(latest);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not read heart rate data.');
    }
  }, []);

  useEffect(() => {
    if (!isHeartRateTrackingSupported()) return;
    (async () => {
      const granted = await hasHeartRatePermission();
      if (granted) {
        setStatus('connected');
        await refresh();
      } else {
        setStatus('disconnected');
      }
    })();
  }, [refresh]);

  if (!isHeartRateTrackingSupported()) return null;

  const onConnect = async () => {
    setStatus('connecting');
    setErrorMsg(null);
    try {
      const granted = await connectHeartRate();
      if (granted) {
        setStatus('connected');
        await refresh();
      } else {
        setStatus('disconnected');
        setErrorMsg('Heart rate permission was not granted in Health Connect.');
      }
    } catch (err) {
      setStatus('disconnected');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong connecting.');
    }
  };

  if (status === 'checking') return null;

  if (status !== 'connected') {
    return (
      <Card style={styles.connectCard}>
        <View style={styles.iconBadge}>
          <Ionicons name="heart" size={22} color={colors.pink} />
        </View>
        <Text style={styles.connectTitle}>Connect your smartwatch</Text>
        <Text style={styles.connectSub}>
          Sync heart rate from Wear OS, Galaxy Watch, Mi Band and more via Health Connect.
        </Text>
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        <Button
          label={status === 'connecting' ? 'Connecting...' : 'Connect'}
          onPress={onConnect}
          loading={status === 'connecting'}
        />
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadgeSmall}>
            <Ionicons name="heart" size={16} color={colors.pink} />
          </View>
          <Text style={styles.title}>Heart rate</Text>
        </View>
        <Pressable onPress={openHealthConnectSettings}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textFaint} />
        </Pressable>
      </View>

      {reading ? (
        <View style={styles.readingRow}>
          <Text style={styles.bpm}>{reading.bpm}</Text>
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.bpmUnit}>bpm</Text>
            <Text style={styles.bpmTime}>{minutesAgo(reading.time)}</Text>
          </View>
          <Pressable style={styles.refreshBtn} onPress={refresh}>
            <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : (
        <Text style={styles.emptyText}>
          No heart rate synced in the last 24h yet — make sure your watch app is syncing to Health
          Connect.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.textPrimary, fontWeight: '700', fontSize: font.size.md },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconBadgeSmall: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectCard: { alignItems: 'flex-start' },
  connectTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md },
  connectSub: {
    color: colors.textFaint,
    fontSize: font.size.xs,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  errorText: { color: colors.red, fontSize: font.size.xs, marginBottom: spacing.sm },
  readingRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.md },
  bpm: { color: colors.pink, fontSize: 40, fontWeight: '800', lineHeight: 44 },
  bpmUnit: { color: colors.textSecondary, fontWeight: '600', fontSize: font.size.sm },
  bpmTime: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  refreshBtn: { marginLeft: 'auto', padding: spacing.xs },
  emptyText: { color: colors.textFaint, fontSize: font.size.sm, marginTop: spacing.md, lineHeight: 18 },
});
