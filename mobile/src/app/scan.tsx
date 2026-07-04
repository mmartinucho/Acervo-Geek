import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';

// Modal do scanner (protótipo): câmera full-screen, moldura de foco com
// scanline animada, header e card do item detectado. Sempre escuro (câmera),
// independente do tema.
export default function ScanScreen() {
  const router = useRouter();
  const [frameH, setFrameH] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    // Sobe e desce a linha continuamente (yoyo).
    progress.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, true);
  }, [progress]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * Math.max(0, frameH - 2) }],
  }));

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://picsum.photos/seed/scancard/800/1200' }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.dim} />

      {/* Moldura de foco + scanline */}
      <View
        style={styles.frame}
        onLayout={(e) => setFrameH(e.nativeEvent.layout.height)}>
        <Animated.View style={[styles.scanline, lineStyle]} />
      </View>

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View>
            <X size={20} strokeWidth={2} color="#FFFFFF" />
          </View>
        </Pressable>
        <View style={styles.aiBadge}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View>
            <Sparkles size={14} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.aiText}>Scanner IA</ThemedText>
        </View>
      </SafeAreaView>

      {/* Card do item detectado */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.detectCard}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <ThemedText style={styles.detectName}>Blue-Eyes White Dragon</ThemedText>
          <ThemedText style={styles.detectCode}>LOB-001 • Rare</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.registerBtn}>
            <ThemedText style={styles.registerText}>Registrar Item</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  frame: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    bottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 40,
    overflow: 'hidden',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.40)',
    overflow: 'hidden',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.40)',
    overflow: 'hidden',
  },
  aiText: {
    fontFamily: Fonts.semibold,
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  detectCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.60)',
    padding: Spacing.five,
    alignItems: 'center',
    overflow: 'hidden',
  },
  detectName: {
    fontFamily: Fonts.medium,
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  detectCode: {
    fontFamily: Fonts.semibold,
    color: 'rgba(255,255,255,0.50)',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: Spacing.two,
    marginBottom: Spacing.five,
  },
  registerBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  registerText: {
    fontFamily: Fonts.medium,
    color: '#000000',
    fontSize: 15,
  },
});
