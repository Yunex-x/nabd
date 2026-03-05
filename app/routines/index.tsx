import { Routine } from '@/types';
import { loadJSON, saveJSON } from '@/utils/storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
const STORAGE_KEY = 'user-routines';

export default function RoutinesIndexScreen({ navigation }: any) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [newName, setNewName] = useState('');

  const sanitizeRoutines = (value: unknown): Routine[] => {
    if (!Array.isArray(value)) return [];
    return value
      .filter((entry): entry is Partial<Routine> => typeof entry === 'object' && entry !== null)
      .map((entry) => ({
        id: String(entry.id ?? `routine-${Date.now()}`),
        name: String(entry.name ?? 'Routine'),
        items: Array.isArray(entry.items)
          ? entry.items.filter((item): item is string => typeof item === 'string')
          : [],
      }));
  };

  useEffect(() => {
    loadJSON<Routine[]>(STORAGE_KEY, []).then((r) => {
      setRoutines(sanitizeRoutines(r));
    });
  }, []);

  const persist = async (items: Routine[]) => {
    setRoutines(items);
    await saveJSON(STORAGE_KEY, items);
  };

  const add = async () => {
    if (!newName.trim()) return;
    const r = { id: `routine-${Date.now()}`, name: newName.trim(), items: [] };
    await persist([r, ...routines]);
    setNewName('');
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Routine>) => {
    return (
      <View style={[styles.row, isActive && { backgroundColor: '#eee' }]}>
        <Text style={styles.name}>{item.name}</Text>
        <Button title="Open" onPress={() => navigation.navigate('RoutineDetail', { id: item.id })} />
        <Button title="Drag" onPress={drag} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Routines</Text>
      <View style={styles.createRow}>
        <TextInput value={newName} onChangeText={setNewName} placeholder="New routine name" style={styles.input} />
        <Button title="Create" onPress={add} />
      </View>
      <DraggableFlatList
        data={routines}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => persist(data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontWeight: '600' },
  createRow: { flexDirection: 'row', marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, marginRight: 8, padding: 8 },
});