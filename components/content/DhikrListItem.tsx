import { NormalizedContentItem } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DhikrCounter } from '../dhikr/DhikrCounter';

type Props = {
    item: NormalizedContentItem;
};

export const DhikrListItem: React.FC<Props> = React.memo(({ item }) => {
    return (
        <View style={styles.row}>
            <View style={styles.textWrap}>
                <Text style={styles.title}>{item.title || item.section}</Text>
                <Text numberOfLines={2} style={styles.text}>
                    {item.text}
                </Text>
            </View>
            <DhikrCounter id={item.id} target={item.repetitions ?? 1} />
        </View>
    );
});

const styles = StyleSheet.create({
    row: { flexDirection: 'row', padding: 12, alignItems: 'center', justifyContent: 'space-between' },
    textWrap: { flex: 1, marginRight: 12 },
    title: { fontWeight: '700' },
    text: { color: '#333', marginTop: 4 },
});