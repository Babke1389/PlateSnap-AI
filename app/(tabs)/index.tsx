import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BodyMeasurementsCard } from '../../src/components/BodyMeasurementsCard';
import { Card } from '../../src/components/Card';
import { HeartRateCard } from '../../src/components/HeartRateCard';
import { MacroBar } from '../../src/components/MacroBar';
import { ReminderCard } from '../../src/components/ReminderCard';
import { Ring } from '../../src/components/Ring';
import { WeekStrip } from '../../src/components/WeekStrip';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { formatDayLabel, todayISO } from '../../src/lib/calories';
import { useStore } from '../../src/lib/store';
import { colors, font, radius, spacing } from '../../src/theme';

const WATER_GOAL_ML = 2500;
const WATER_STEP_ML = 250;

export default function Home() {
  const router = useRouter();
  const { profile, targets, isPro, totalsForDate, mealsForDate, waterForDate, addWater, streakDays } =
    useStore();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const totals = totalsForDate(selectedDate);
  const meals = mealsForDate(selectedDate).slice(0, 4);
  const water = waterForDate(selectedDate);
  const streak = streakDays();
  const isToday = selectedDate === todayISO();

  if (!profile || !targets) return null;

  const remaining = Math.max(targets.calorieTarget - totals.calories, 0);
  const progress = totals.calories / targets.calorieTarget;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{formatDayLabel(selectedDate)}</Text>
            <Text style={styles.date}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {!isPro ? (
              <Pressable style={styles.premiumPill} onPress={() => router.push('/paywall')}>
                <Text style={styles.premiumPillText}>Try Premium</Text>
              </Pressable>
            ) : null}
            {streak > 0 ? (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color={colors.orange} />
                <Text style={styles.streakText}>{streak}d</Text>
              </View>
            ) : null}
          </View>
        </View>

        <WeekStrip
          selectedDateISO={selectedDate}
          onSelect={setSelectedDate}
          hasEntry={(iso) => mealsForDate(iso).length > 0}
        />

        <Card style={styles.ringCard}>
          <Ring
            progress={progress}
            color={progress > 1 ? colors.red : colors.lime}
            label={`${remaining}`}
            sublabel={progress > 1 ? 'kcal over' : 'kcal left'}
          />
          <View style={styles.ringStatsRow}>
            <Stat label="Eaten" value={totals.calories} />
            <Stat label="Goal" value={targets.calorieTarget} />
            <Stat label="Base" value={targets.tdee} />
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>Macros</Text>
          <MacroBar label="Protein" color={colors.protein} valueG={totals.proteinG} targetG={targets.proteinG} />
          <MacroBar label="Carbs" color={colors.carbs} valueG={totals.carbsG} targetG={targets.carbsG} />
          <MacroBar label="Fat" color={colors.fat} valueG={totals.fatG} targetG={targets.fatG} />
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.waterHeader}>
            <Text style={styles.sectionTitle}>Water</Text>
            <Text style={styles.waterAmount}>
              {(water / 1000).toFixed(2)}L <Text style={styles.waterGoal}>/ {(WATER_GOAL_ML / 1000).toFixed(1)}L</Text>
            </Text>
          </View>
          <View style={styles.waterTrack}>
            <View
              style={[
                styles.waterFill,
                { width: `${Math.min((water / WATER_GOAL_ML) * 100, 100)}%` },
              ]}
            />
          </View>
          <View style={styles.waterButtons}>
            <Pressable style={styles.waterBtn} onPress={() => addWater(-WATER_STEP_ML, selectedDate)}>
              <Ionicons name="remove" size={18} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.waterStep}>{WATER_STEP_ML}ml glass</Text>
            <Pressable
              style={[styles.waterBtn, styles.waterBtnAdd]}
              onPress={() => addWater(WATER_STEP_ML, selectedDate)}
            >
              <Ionicons name="add" size={18} color="#0B0D12" />
            </Pressable>
          </View>
        </Card>

        <View style={{ marginTop: spacing.md }}>
          <WorkoutCard dateISO={selectedDate} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <HeartRateCard />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <BodyMeasurementsCard />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <ReminderCard />
        </View>

        <View style={styles.mealsHeader}>
          <Text style={styles.sectionTitle}>{isToday ? "Today's meals" : `${formatDayLabel(selectedDate)}'s meals`}</Text>
          <Pressable onPress={() => router.push('/(tabs)/diary')}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        {meals.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              {isToday ? 'No meals logged yet. Tap + to add your first meal.' : 'No meals logged this day.'}
            </Text>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} style={styles.mealCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealDesc} numberOfLines={1}>
                  {meal.description}
                </Text>
                <Text style={styles.mealMeta}>
                  P {meal.proteinG}g · C {meal.carbsG}g · F {meal.fatG}g
                </Text>
              </View>
              <Text style={styles.mealCals}>{meal.calories}</Text>
            </Card>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push({ pathname: '/add-meal', params: { date: selectedDate } })}
      >
        <Ionicons name="add" size={30} color="#0B0D12" />
      </Pressable>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: { color: colors.textSecondary, fontSize: font.size.sm, fontWeight: '600' },
  date: { color: colors.textPrimary, fontSize: font.size.xl, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  premiumPill: {
    backgroundColor: colors.yellow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  premiumPillText: { color: '#0B0D12', fontWeight: '800', fontSize: font.size.sm },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 4,
  },
  streakText: { color: colors.textPrimary, fontWeight: '700', fontSize: font.size.sm },
  ringCard: { alignItems: 'center', paddingVertical: spacing.lg },
  ringStatsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    width: '100%',
    justifyContent: 'space-between',
  },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md },
  statLabel: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  sectionTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.md },
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  waterAmount: { color: colors.blue, fontWeight: '800', fontSize: font.size.md },
  waterGoal: { color: colors.textFaint, fontWeight: '400', fontSize: font.size.sm },
  waterTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    overflow: 'hidden',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  waterFill: { height: '100%', backgroundColor: colors.blue, borderRadius: radius.pill },
  waterButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  waterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterBtnAdd: { backgroundColor: colors.blue },
  waterStep: { color: colors.textSecondary, fontSize: font.size.sm, minWidth: 90, textAlign: 'center' },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  viewAll: { color: colors.lime, fontWeight: '600', fontSize: font.size.sm },
  emptyText: { color: colors.textFaint, fontSize: font.size.sm },
  mealCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  mealDesc: { color: colors.textPrimary, fontWeight: '600' },
  mealMeta: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  mealCals: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md, marginLeft: spacing.sm },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.lime,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
