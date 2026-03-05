import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  index: number;
  total: number;
};

export const SessionProgressBar: React.FC<Props> = ({ index, total }) => {
  const progress = total === 0 ? 0 : (index + 1) / total;
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={styles.label}>
        {index + 1} / {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
  bar: { height: 8, backgroundColor: '#eee', borderRadius: 8, overflow: 'hidden', flexDirection: 'row' },
  fill: { backgroundColor: '#4caf50' },
  label: { marginTop: 6, textAlign: 'center' },
});