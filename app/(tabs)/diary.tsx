import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { addDaysISO, formatDayLabel, todayISO } from '../../src/lib/calories';
import { useStore } from '../../src/lib/store';
import { colors, font, radius, spacing } from '../../src/theme';

export default function Diary() {
  const router = useRouter();
  const { mealsForDate, totalsForDate, removeMeal, targets } = useStore();
  const [dateISO, setDateISO] = useState(todayISO());

  const meals = mealsForDate(dateISO);
  const totals = totalsForDate(dateISO);
  const isToday = dateISO === todayISO();

  const confirmDelete = (id: string, desc: string) => {
    Alert.alert('Remove meal', `Remove "${desc}" from your diary?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMeal(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.dateNav}>
        <Pressable style={styles.navBtn} onPress={() => setDateISO(addDaysISO(dateISO, -1))}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.dateLabel}>{formatDayLabel(dateISO)}</Text>
        <Pressable
          style={[styles.navBtn, isToday && styles.navBtnDisabled]}
          onPress={() => !isToday && setDateISO(addDaysISO(dateISO, 1))}
          disabled={isToday}
        >
          <Ionicons name="chevron-forward" size={20} color={isToday ? colors.textFaint : colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.summaryCard}>
          <SummaryStat label="Calories" value={totals.calories} color={colors.lime} target={targets?.calorieTarget} />
          <SummaryStat label="Protein" value={totals.proteinG} color={colors.protein} unit="g" />
          <SummaryStat label="Carbs" value={totals.carbsG} color={colors.carbs} unit="g" />
          <SummaryStat label="Fat" value={totals.fatG} color={colors.fat} unit="g" />
        </Card>

        {meals.length === 0 ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.emptyText}>No meals logged on this day.</Text>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} style={styles.mealCard}>
              <View style={styles.mealIcon}>
                <Ionicons
                  name={
                    meal.source === 'photo'
                      ? 'camera'
                      : meal.source === 'manual'
                      ? 'create-outline'
                      : meal.source === 'barcode'
                      ? 'barcode-outline'
                      : 'chatbubble-ellipses'
                  }
                  size={16}
                  color={colors.textFaint}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealDesc}>{meal.description}</Text>
                <Text style={styles.mealMeta}>
                  P {meal.proteinG}g · C {meal.carbsG}g · F {meal.fatG}g
                </Text>
              </View>
              <Text style={styles.mealCals}>{meal.calories}</Text>
              <Pressable style={styles.deleteBtn} onPress={() => confirmDelete(meal.id, meal.description)}>
                <Ionicons name="trash-outline" size={18} color={colors.red} />
              </Pressable>
            </Card>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push({ pathname: '/add-meal', params: { date: dateISO } })}
      >
        <Ionicons name="add" size={30} color="#0B0D12" />
      </Pressable>
    </SafeAreaView>
  );
}

function SummaryStat({
  label,
  value,
  color,
  target,
  unit,
}: {
  label: string;
  value: number;
  color: string;
  target?: number;
  unit?: string;
}) {
  return (
    <View style={styles.summaryStat}>
      <View style={[styles.summaryDot, { backgroundColor: color }]} />
      <Text style={styles.summaryValue}>
        {Math.round(value)}
        {unit ?? ''}
        {target ? <Text style={styles.summaryTarget}>/{target}</Text> : null}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  dateLabel: { color: colors.textPrimary, fontSize: font.size.lg, fontWeight: '800' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStat: { alignItems: 'center', flex: 1 },
  summaryDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  summaryValue: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md },
  summaryTarget: { color: colors.textFaint, fontWeight: '400', fontSize: font.size.xs },
  summaryLabel: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  emptyText: { color: colors.textFaint, fontSize: font.size.sm },
  mealCard: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  mealIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  mealDesc: { color: colors.textPrimary, fontWeight: '600' },
  mealMeta: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  mealCals: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md, marginLeft: spacing.sm },
  deleteBtn: { marginLeft: spacing.md, padding: 4 },
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
