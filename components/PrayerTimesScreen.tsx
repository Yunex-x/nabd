// components/PrayerTimesScreen.tsx
// Simple UI to show times, refresh, and toggle scheduling.

import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import usePrayerTimes from '../hooks/usePrayerTimes';

export default function PrayerTimesScreen() {
  const [autoSchedule, setAutoSchedule] = useState(true);
  const { times, loading, error, refresh, cancelAllNotifications } = usePrayerTimes({ autoSchedule });

  if (loading) return <ActivityIndicator style={styles.center} />;

  if (error) return (
    <View style={styles.center}>
      <Text>Error: {error}</Text>
      <Button title="Retry" onPress={refresh} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Prayer Times</Text>
      {times ? (
        <>
          <Text>Fajr: {times.fajr.toLocaleTimeString()}</Text>
          <Text>Sunrise: {times.sunrise.toLocaleTimeString()}</Text>
          <Text>Dhuhr: {times.dhuhr.toLocaleTimeString()}</Text>
          <Text>Asr: {times.asr.toLocaleTimeString()}</Text>
          <Text>Maghrib: {times.maghrib.toLocaleTimeString()}</Text>
          <Text>Isha: {times.isha.toLocaleTimeString()}</Text>
        </>
      ) : (
        <Text>No times available</Text>
      )}

      <View style={styles.buttons}>
        <Button title="Refresh" onPress={refresh} />
        <Button title={autoSchedule ? "Auto schedule: ON" : "Auto schedule: OFF"} onPress={() => setAutoSchedule(s => !s)} />
        <Button title="Cancel All Notifications" onPress={cancelAllNotifications} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  buttons: { marginTop: 16, gap: 8 },
});