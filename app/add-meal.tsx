import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Segmented } from '../src/components/Segmented';
import { TextField } from '../src/components/TextField';
import { analyzeMealPhoto, analyzeMealText, isAiConfigured, NoFoodDetectedError } from '../src/lib/ai';
import { FREE_DAILY_PHOTO_SCANS } from '../src/lib/constants';
import { useStore } from '../src/lib/store';
import { MealAnalysis } from '../src/lib/types-ai';
import { colors, font, radius, spacing } from '../src/theme';

const aiConfigured = isAiConfigured();

type Mode = 'text' | 'photo' | 'manual';

export default function AddMeal() {
  const router = useRouter();
  const { isPro, addMeal, favorites, photoScansToday, recordPhotoScan, addFavorite, logFavorite } =
    useStore();
  const [mode, setMode] = useState<Mode>('text');

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);

  const [manualDesc, setManualDesc] = useState('');
  const [manualCals, setManualCals] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const photoScansUsedToday = photoScansToday();
  const canUsePhotoFree = photoScansUsedToday < FREE_DAILY_PHOTO_SCANS;
  const canUsePhoto = isPro || canUsePhotoFree;

  const reset = () => {
    setDescription('');
    setResult(null);
    setPhotoUri(null);
    setErrorText(null);
    setSaveAsFavorite(false);
  };

  const onAnalyzeText = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setErrorText(null);
    setResult(null);
    try {
      const analysis = await analyzeMealText(description.trim());
      setResult(analysis);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Something went wrong analyzing this.');
    } finally {
      setLoading(false);
    }
  };

  const pickPhoto = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const picked = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true, base64: aiConfigured })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true, base64: aiConfigured });

    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    setPhotoUri(asset.uri);
    setResult(null);
    setErrorText(null);
    setLoading(true);
    try {
      const analysis = await analyzeMealPhoto({
        uri: asset.uri,
        base64: asset.base64 ?? undefined,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
      setResult(analysis);
      recordPhotoScan();
    } catch (err) {
      if (err instanceof NoFoodDetectedError) {
        setErrorText("Didn't spot any food in this photo — try a clearer shot of your plate.");
        recordPhotoScan();
      } else {
        setErrorText(err instanceof Error ? err.message : 'Something went wrong analyzing this photo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onLog = () => {
    if (!result) return;
    const finalDescription = mode === 'photo' ? result.items.join(', ') : description.trim();
    addMeal({
      source: mode as 'text' | 'photo',
      description: finalDescription,
      photoUri: photoUri ?? undefined,
      calories: result.calories,
      proteinG: result.proteinG,
      carbsG: result.carbsG,
      fatG: result.fatG,
      items: result.items,
    });
    if (isPro && saveAsFavorite) {
      addFavorite({
        description: finalDescription,
        calories: result.calories,
        proteinG: result.proteinG,
        carbsG: result.carbsG,
        fatG: result.fatG,
      });
    }
    router.back();
  };

  const canLogManual = manualDesc.trim().length > 0 && Number(manualCals) > 0;

  const onLogManual = () => {
    if (!canLogManual) return;
    const favorite = {
      description: manualDesc.trim(),
      calories: Math.round(Number(manualCals)) || 0,
      proteinG: Math.round(Number(manualProtein)) || 0,
      carbsG: Math.round(Number(manualCarbs)) || 0,
      fatG: Math.round(Number(manualFat)) || 0,
    };
    addMeal({ source: 'manual', ...favorite });
    if (isPro && saveAsFavorite) {
      addFavorite(favorite);
    }
    router.back();
  };

  const onLogFavorite = (favId: string) => {
    const fav = favorites.find((f) => f.id === favId);
    if (!fav) return;
    logFavorite(fav);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Add a meal</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Segmented
            options={[
              { label: 'Describe', value: 'text' },
              { label: 'Manual', value: 'manual' },
              { label: canUsePhoto ? 'Photo' : 'Photo (Pro)', value: 'photo' },
            ]}
            value={mode}
            onChange={(m) => {
              setMode(m);
              reset();
            }}
          />

          <View style={{ marginTop: spacing.lg }}>
            {mode === 'text' ? (
              <>
                <TextField
                  label="What did you eat?"
                  placeholder="e.g. Grilled chicken breast, rice and steamed broccoli"
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 90, textAlignVertical: 'top' }}
                  value={description}
                  onChangeText={(t) => {
                    setDescription(t);
                    setResult(null);
                  }}
                />
                <Text style={styles.hint}>
                  {aiConfigured
                    ? 'Analyzed by AI for a real estimate — still approximate, not gram-exact.'
                    : 'Matches common foods from a lookup table for a rough estimate — not a real nutrition database. For exact numbers, use "Manual" instead.'}
                </Text>
                <Button
                  label={loading ? 'Analyzing...' : 'Analyze'}
                  onPress={onAnalyzeText}
                  disabled={!description.trim()}
                  loading={loading}
                  style={{ marginTop: spacing.sm }}
                />
              </>
            ) : mode === 'manual' ? (
              <>
                {isPro && favorites.length > 0 ? (
                  <View style={{ marginBottom: spacing.md }}>
                    <Text style={styles.favoritesLabel}>Favorites — tap to log instantly</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        {favorites.map((fav) => (
                          <Pressable
                            key={fav.id}
                            style={styles.favoriteChip}
                            onPress={() => onLogFavorite(fav.id)}
                          >
                            <Text style={styles.favoriteChipTitle} numberOfLines={1}>
                              {fav.description}
                            </Text>
                            <Text style={styles.favoriteChipCals}>{fav.calories} kcal</Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                ) : !isPro ? (
                  <Card style={styles.infoCard}>
                    <Ionicons name="star" size={16} color={colors.lime} />
                    <Text style={styles.infoText}>
                      Pro unlocks saving meals as favorites for instant one-tap re-logging.
                    </Text>
                  </Card>
                ) : null}
                <TextField
                  label="What did you eat?"
                  placeholder="e.g. Protein pudding"
                  value={manualDesc}
                  onChangeText={setManualDesc}
                />
                <TextField
                  label="Calories"
                  placeholder="e.g. 160"
                  keyboardType="number-pad"
                  suffix="kcal"
                  value={manualCals}
                  onChangeText={setManualCals}
                />
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="Protein"
                      placeholder="20"
                      keyboardType="number-pad"
                      suffix="g"
                      value={manualProtein}
                      onChangeText={setManualProtein}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="Carbs"
                      placeholder="0"
                      keyboardType="number-pad"
                      suffix="g"
                      value={manualCarbs}
                      onChangeText={setManualCarbs}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="Fat"
                      placeholder="0"
                      keyboardType="number-pad"
                      suffix="g"
                      value={manualFat}
                      onChangeText={setManualFat}
                    />
                  </View>
                </View>
                {isPro ? (
                  <Pressable
                    style={styles.favoriteToggle}
                    onPress={() => setSaveAsFavorite((v) => !v)}
                  >
                    <Ionicons
                      name={saveAsFavorite ? 'star' : 'star-outline'}
                      size={18}
                      color={saveAsFavorite ? colors.lime : colors.textFaint}
                    />
                    <Text style={styles.favoriteToggleText}>Save as favorite for next time</Text>
                  </Pressable>
                ) : null}
                <Button label="Log this meal" onPress={onLogManual} disabled={!canLogManual} />
              </>
            ) : !canUsePhoto ? (
              <Card style={styles.lockedCard}>
                <Ionicons name="lock-closed" size={28} color={colors.orange} />
                <Text style={styles.lockedTitle}>You've used today's free photo scan</Text>
                <Text style={styles.lockedSub}>
                  Free plan includes {FREE_DAILY_PHOTO_SCANS} photo scan per day. Upgrade to Pro
                  for unlimited scans, or come back tomorrow.
                </Text>
                <Button label="Upgrade to Pro" onPress={() => router.push('/paywall')} />
              </Card>
            ) : (
              <>
                {aiConfigured ? (
                  <Card style={styles.infoCard}>
                    <Ionicons name="sparkles" size={18} color={colors.lime} />
                    <Text style={styles.infoText}>
                      AI photo scanning is on — it'll check whether there's food in the photo and
                      estimate calories and macros from what it sees.
                    </Text>
                  </Card>
                ) : (
                  <Card style={styles.warnCard}>
                    <Ionicons name="warning" size={18} color={colors.orange} />
                    <Text style={styles.warnText}>
                      Demo mode: photo scanning isn't connected to a real vision AI yet, so it can't
                      actually see what's in your photo (or notice when there's no food at all) —
                      the number below is a placeholder guess. Use "Describe" or "Manual" for
                      anything you need to be accurate.
                    </Text>
                  </Card>
                )}
                {!isPro ? (
                  <Text style={styles.freeScanNote}>
                    This is your free photo scan for today ({photoScansUsedToday}/
                    {FREE_DAILY_PHOTO_SCANS} used) — more scans need Pro.
                  </Text>
                ) : null}
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.preview} />
                ) : (
                  <View style={styles.photoButtons}>
                    <Pressable style={styles.photoBtn} onPress={() => pickPhoto(true)}>
                      <Ionicons name="camera" size={26} color={colors.textPrimary} />
                      <Text style={styles.photoBtnLabel}>Take photo</Text>
                    </Pressable>
                    <Pressable style={styles.photoBtn} onPress={() => pickPhoto(false)}>
                      <Ionicons name="images" size={26} color={colors.textPrimary} />
                      <Text style={styles.photoBtnLabel}>Choose photo</Text>
                    </Pressable>
                  </View>
                )}
                {loading ? <Text style={styles.analyzing}>Scanning your plate...</Text> : null}
              </>
            )}
          </View>

          {errorText ? (
            <Card style={styles.warnCard}>
              <Ionicons name="alert-circle" size={18} color={colors.red} />
              <Text style={styles.warnText}>{errorText}</Text>
            </Card>
          ) : null}

          {result ? (
            <Card style={styles.resultCard}>
              <Text style={styles.resultTitle}>
                {result.confidence === 'ai'
                  ? 'AI estimate'
                  : result.confidence === 'matched'
                  ? 'Estimate'
                  : 'Rough guess'}
              </Text>
              <Text style={styles.resultCals}>{result.calories} kcal</Text>
              <Text style={styles.resultMacros}>
                Protein {result.proteinG}g · Carbs {result.carbsG}g · Fat {result.fatG}g
              </Text>
              {result.confidence === 'ai' ? (
                <Text style={styles.resultDisclaimer}>
                  Detected: {result.items.join(', ')} — AI estimate, may not be exact.
                </Text>
              ) : result.confidence === 'matched' ? (
                <Text style={styles.resultDisclaimer}>
                  Matched: {result.items.join(', ')} — still approximate, not gram-exact.
                </Text>
              ) : (
                <Text style={[styles.resultDisclaimer, { color: colors.orange }]}>
                  Didn't recognize specific foods, so this is a generic placeholder guess, not a
                  real estimate.
                </Text>
              )}
              {isPro ? (
                <Pressable
                  style={styles.favoriteToggle}
                  onPress={() => setSaveAsFavorite((v) => !v)}
                >
                  <Ionicons
                    name={saveAsFavorite ? 'star' : 'star-outline'}
                    size={18}
                    color={saveAsFavorite ? colors.lime : colors.textFaint}
                  />
                  <Text style={styles.favoriteToggleText}>Save as favorite for next time</Text>
                </Pressable>
              ) : null}
              <Button label="Log this meal" onPress={onLog} style={{ marginTop: spacing.md }} />
            </Card>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: { color: colors.textPrimary, fontSize: font.size.lg, fontWeight: '800' },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: spacing.lg },
  hint: {
    color: colors.textFaint,
    fontSize: font.size.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  lockedCard: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  lockedTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md, textAlign: 'center' },
  lockedSub: {
    color: colors.textFaint,
    fontSize: font.size.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  warnCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderColor: colors.orange,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  warnText: { color: colors.textSecondary, fontSize: font.size.xs, flex: 1, lineHeight: 16 },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderColor: colors.lime,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  infoText: { color: colors.textSecondary, fontSize: font.size.xs, flex: 1, lineHeight: 16 },
  favoritesLabel: {
    color: colors.textSecondary,
    fontSize: font.size.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  favoriteChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 120,
    maxWidth: 180,
  },
  favoriteChipTitle: { color: colors.textPrimary, fontWeight: '600', fontSize: font.size.xs },
  favoriteChipCals: { color: colors.lime, fontWeight: '700', fontSize: font.size.xs, marginTop: 2 },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  favoriteToggleText: { color: colors.textSecondary, fontSize: font.size.xs, fontWeight: '600' },
  freeScanNote: {
    color: colors.textFaint,
    fontSize: font.size.xs,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  photoButtons: { flexDirection: 'row', gap: spacing.md },
  photoBtn: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  photoBtnLabel: { color: colors.textSecondary, fontWeight: '600', fontSize: font.size.sm },
  preview: { width: '100%', aspectRatio: 1, borderRadius: radius.lg },
  analyzing: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  resultCard: { marginTop: spacing.lg, alignItems: 'center' },
  resultTitle: { color: colors.textSecondary, fontSize: font.size.sm, fontWeight: '600' },
  resultCals: { color: colors.lime, fontSize: 40, fontWeight: '800', marginTop: spacing.xs },
  resultMacros: { color: colors.textSecondary, fontSize: font.size.sm, marginTop: spacing.xs },
  resultDisclaimer: {
    color: colors.textFaint,
    fontSize: font.size.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
