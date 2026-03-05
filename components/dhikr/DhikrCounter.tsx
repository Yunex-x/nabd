import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  id: string;
  target?: number;
  onComplete?: () => void;
  style?: any;
};

const STORAGE_PREFIX = 'dhikr-progress:';

export const DhikrCounter: React.FC<Props> = ({ id, target = 1, onComplete, style }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_PREFIX + id).then((v) => {
      if (!mounted) return;
      if (v) setCount(Number(v));
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  const persist = useCallback(async (c: number) => {
    await AsyncStorage.setItem(STORAGE_PREFIX + id, String(c));
  }, [id]);

  const handleTap = useCallback(
    (e?: GestureResponderEvent) => {
      Haptics.selectionAsync();
      setCount((prev) => {
        const next = prev + 1;
        persist(next);
        if (next >= target && onComplete) {
          onComplete();
        }
        return next;
      });
    },
    [persist, target, onComplete]
  );

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCount(0);
    persist(0);
  }, [persist]);

  return (
    <Pressable
      onPress={handleTap}
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={({ pressed }) => [styles.container, style, pressed && styles.pressed]}
    >
      <View>
        <Text style={styles.countText}>
          {count} / {target}
        </Text>
        <Text style={styles.hintText}>Tap to increment • Long press to reset</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  pressed: { opacity: 0.8 },
  countText: { fontSize: 18, fontWeight: '600' },
  hintText: { fontSize: 12, color: '#666' },
});