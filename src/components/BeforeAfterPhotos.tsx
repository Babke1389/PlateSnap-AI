import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { ProgressPhoto } from '../lib/types';
import { colors, font, radius, spacing } from '../theme';
import { Button } from './Button';
import { Card } from './Card';

async function pickImage(fromCamera: boolean): Promise<string | null> {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const picked = fromCamera
    ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true, aspect: [3, 4] })
    : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true, aspect: [3, 4] });

  if (picked.canceled || !picked.assets?.[0]) return null;
  return picked.assets[0].uri;
}

function PhotoSlot({
  label,
  photo,
  onAdd,
  onClear,
}: {
  label: string;
  photo: ProgressPhoto | null;
  onAdd: () => void;
  onClear: () => void;
}) {
  if (photo) {
    return (
      <View style={styles.slot}>
        <Image source={{ uri: photo.uri }} style={styles.slotImage} />
        <Pressable style={styles.clearBtn} onPress={onClear}>
          <Ionicons name="close" size={14} color="#fff" />
        </Pressable>
        <View style={styles.slotBadge}>
          <Text style={styles.slotBadgeText}>{Math.round(photo.weightKg)} kg</Text>
        </View>
        <Text style={styles.slotLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable style={[styles.slot, styles.slotEmpty]} onPress={onAdd}>
      <Ionicons name="add-circle-outline" size={28} color={colors.textFaint} />
      <Text style={styles.slotEmptyText}>Add {label.toLowerCase()} photo</Text>
    </Pressable>
  );
}

export function BeforeAfterPhotos() {
  const router = useRouter();
  const { isPro, beforePhoto, afterPhoto, setProgressPhoto, clearProgressPhoto } = useStore();

  const choosePhoto = (which: 'before' | 'after') => {
    Alert.alert('Add photo', undefined, [
      {
        text: 'Take photo',
        onPress: async () => {
          const uri = await pickImage(true);
          if (uri) setProgressPhoto(which, uri);
        },
      },
      {
        text: 'Choose from library',
        onPress: async () => {
          const uri = await pickImage(false);
          if (uri) setProgressPhoto(which, uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const confirmClear = (which: 'before' | 'after') => {
    Alert.alert('Remove photo', 'Remove this progress photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => clearProgressPhoto(which) },
    ]);
  };

  const delta =
    beforePhoto && afterPhoto ? Math.round((afterPhoto.weightKg - beforePhoto.weightKg) * 10) / 10 : null;

  if (!isPro) {
    return (
      <Card style={styles.lockedCard}>
        <Ionicons name="lock-closed" size={28} color={colors.orange} />
        <Text style={styles.lockedTitle}>Before & After is a Pro feature</Text>
        <Text style={styles.lockedSub}>
          Save a photo when you start and another when you hit your goal, side by side.
        </Text>
        <Button label="Unlock Pro" onPress={() => router.push('/paywall')} />
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.title}>Before & After</Text>
      <Text style={styles.subtitle}>
        Snap one when you start, and another once you hit your goal.
      </Text>
      <View style={styles.row}>
        <PhotoSlot
          label="Before"
          photo={beforePhoto}
          onAdd={() => choosePhoto('before')}
          onClear={() => confirmClear('before')}
        />
        <PhotoSlot
          label="After"
          photo={afterPhoto}
          onAdd={() => choosePhoto('after')}
          onClear={() => confirmClear('after')}
        />
      </View>
      {delta !== null ? (
        <Text style={[styles.delta, { color: delta <= 0 ? colors.lime : colors.orange }]}>
          {delta > 0 ? '+' : ''}
          {delta} kg between photos
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  lockedCard: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  lockedTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md, textAlign: 'center' },
  lockedSub: {
    color: colors.textFaint,
    fontSize: font.size.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: { color: colors.textPrimary, fontWeight: '700', fontSize: font.size.md },
  subtitle: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  slot: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.cardAlt,
  },
  slotEmpty: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  slotEmptyText: { color: colors.textFaint, fontSize: font.size.xs, textAlign: 'center', paddingHorizontal: spacing.sm },
  slotImage: { width: '100%', height: '100%' },
  slotLabel: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    color: '#fff',
    fontSize: font.size.xs,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  clearBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  slotBadgeText: { color: '#fff', fontSize: font.size.xs, fontWeight: '700' },
  delta: {
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '700',
    fontSize: font.size.sm,
  },
});
