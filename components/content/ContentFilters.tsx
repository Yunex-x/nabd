import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { ContentFiltersType } from '../../hooks/useContentSearch';

type Props = {
  filters: ContentFiltersType;
  setFilters: (f: ContentFiltersType) => void;
};

export const ContentFilters: React.FC<Props> = ({ filters, setFilters }) => {
  return (
    <View style={styles.container}>
      <FilterSwitch
        label="Favorites"
        value={filters.favoritesOnly}
        onValueChange={(v) => setFilters({ ...filters, favoritesOnly: v })}
      />
      <FilterSwitch
        label="Short Adhkar"
        value={filters.shortOnly}
        onValueChange={(v) => setFilters({ ...filters, shortOnly: v })}
      />
      <FilterSwitch
        label="Sleep Adhkar"
        value={filters.sleepOnly}
        onValueChange={(v) => setFilters({ ...filters, sleepOnly: v })}
      />
    </View>
  );
};

const FilterSwitch: React.FC<{ label: string; value: boolean; onValueChange: (v: boolean) => void }> = ({
  label,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-around', padding: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  label: { marginRight: 8 },
});