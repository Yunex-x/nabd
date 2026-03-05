import { PRAYERS_GROUPS } from '@/data/ad3iya';
import { ADKAR_DATA } from '@/data/adkar';
import { NormalizedContentItem, Routine } from '@/types';
import { normalizeAd3iyaItem, normalizeAdkarItem } from '@/utils/normalizeContent';
import { loadJSON, saveJSON } from '@/utils/storage';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

const STORAGE_KEY = 'user-routines';

function safeItems(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function normalizeRoutine(routine: Partial<Routine> & { id: string; name: string }): Routine {
    return {
        id: routine.id,
        name: routine.name,
        items: safeItems(routine.items),
    };
}

async function getAllDhikr(): Promise<NormalizedContentItem[]> {
    const adkar = Object.entries(ADKAR_DATA).flatMap(([groupKey, items]) =>
        (Array.isArray(items) ? items : []).map((item) => normalizeAdkarItem(item, groupKey)),
    );

    const ad3iya = Object.entries(PRAYERS_GROUPS).flatMap(([groupKey, items]) =>
        (Array.isArray(items) ? items : []).map((item) => normalizeAd3iyaItem(item, groupKey)),
    );

    return [...adkar, ...ad3iya];
}

export default function RoutineDetailScreen({ navigation }: any) {
    const route = useRoute();
    const { id } = route.params as { id: string };
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [allDhikr, setAllDhikr] = useState<NormalizedContentItem[]>([]);

    useEffect(() => {
        loadJSON<Routine[]>(STORAGE_KEY, []).then((rs) => {
            const safeList = Array.isArray(rs) ? rs : [];
            const found = safeList.find((r) => r?.id === id);
            setRoutine(found ? normalizeRoutine(found as Routine) : null);
        });
        getAllDhikr().then(setAllDhikr);
    }, [id]);

    const save = async (r: Routine) => {
        const list = (await loadJSON<Routine[]>(STORAGE_KEY, [])) || [];
        const normalized = normalizeRoutine(r);
        const updated = list.map((x) => (x.id === normalized.id ? normalized : normalizeRoutine(x)));
        await saveJSON(STORAGE_KEY, updated);
        setRoutine(normalized);
    };

    if (!routine) return <View style={styles.container}><Text>Loading...</Text></View>;

    const routineItemIds = safeItems(routine.items);
    const items = routineItemIds.map((itemId) => allDhikr.find((content) => content.id === itemId)).filter(Boolean) as NormalizedContentItem[];

    const renderItem = ({ item, drag, isActive }: RenderItemParams<NormalizedContentItem>) => (
        <View style={[styles.row, isActive && { backgroundColor: '#eee' }]}>
            <Text style={styles.name}>{item.title || item.text}</Text>
            <Button title="Remove" onPress={() => {
                const r = { ...routine, items: routine.items.filter((x) => x !== item.id) };
                save(r);
            }} />
            <Button title="Drag" onPress={drag} />
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput
                value={routine.name}
                onChangeText={(t) => setRoutine({ ...routine, name: t })}
                onBlur={() => save({ ...routine, items: routineItemIds })}
                style={styles.input}
            />
            <Text style={{ marginTop: 8 }}>Items</Text>
            <DraggableFlatList
                data={items}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                onDragEnd={({ data }) => {
                    const newOrder = data.map((d) => d.id);
                    const r = { ...routine, items: newOrder };
                    save(r);
                }}
            />
            <Text style={{ marginTop: 12 }}>Add adhkar</Text>
            <FlatList
                data={allDhikr}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text>{item.title || item.text}</Text>
                        <Button
                            title="Add"
                            onPress={() => {
                                if (!routineItemIds.includes(item.id)) {
                                    const r = { ...routine, items: [...routineItemIds, item.id] };
                                    save(r);
                                }
                            }}
                        />
                    </View>
                )}
            />
            <Button title="Delete Routine" onPress={async () => {
                const list = (await loadJSON<Routine[]>(STORAGE_KEY, [])) || [];
                const filtered = list.filter((r) => r.id !== routine.id);
                await saveJSON(STORAGE_KEY, filtered);
                navigation.goBack();
            }} color="red" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12 },
    input: { borderWidth: 1, padding: 8 },
    row: { padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    name: { flex: 1, marginRight: 8 },
});