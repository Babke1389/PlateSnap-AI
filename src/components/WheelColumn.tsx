import React, { useCallback, useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme';

export const ITEM_HEIGHT = 42;
export const VISIBLE_ITEMS = 5;
export const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

interface Props {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
}

export function WheelColumn({ items, selectedIndex, onChange, width }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const lastReportedIndex = useRef(selectedIndex);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    lastReportedIndex.current = selectedIndex;
    // Only sync on mount / external resets, not on every scroll-driven change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snapTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    if (clamped !== lastReportedIndex.current) {
      lastReportedIndex.current = clamped;
      onChange(clamped);
    }
  }, [items.length, onChange]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      snapTo(index);
    },
    [snapTo]
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.column, width ? { width } : null]}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      contentContainerStyle={{ paddingVertical: PADDING }}
      onMomentumScrollEnd={handleScrollEnd}
      onScrollEndDrag={handleScrollEnd}
      scrollEventThrottle={16}
    >
      {items.map((label, i) => {
        const distance = Math.abs(i - selectedIndex);
        return (
          <View key={label + i} style={styles.cell}>
            <Text
              style={[
                styles.cellText,
                distance === 1 && styles.cellTextNear,
                distance === 0 && styles.cellTextSelected,
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  column: {
    height: PICKER_HEIGHT,
  },
  cell: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    color: colors.textFaint,
    fontSize: 17,
  },
  cellTextNear: {
    color: colors.textSecondary,
    fontSize: 19,
  },
  cellTextSelected: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 24,
  },
});
