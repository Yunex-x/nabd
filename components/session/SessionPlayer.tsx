import { NormalizedContentItem } from '@/types';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useDhikrSession } from '../../hooks/useDhikrSession';
import { DhikrCounter } from '../dhikr/DhikrCounter';
import { SessionProgressBar } from './SessionProgressBar';

type Props = {
    items: NormalizedContentItem[];
    onComplete?: (summary: { totalAdhkar: number; totalRepetitions: number; durationMs: number }) => void;
};

export const SessionPlayer: React.FC<Props> = ({ items, onComplete }) => {
    const { state, actions } = useDhikrSession(items);

    const { currentDhikr, currentIndex, running, paused, elapsedMs, totalDhikrCount, totalRepetitions } = state;
    const { start, pause, resume, stop, handleItemComplete, next } = actions;

    if (!running) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Ready to start session</Text>
                <Button title="Start Session" onPress={() => start()} />
            </View>
        );
    }

    if (!currentDhikr) {
        // Session complete
        onComplete?.({ totalAdhkar: totalDhikrCount, totalRepetitions, durationMs: elapsedMs });
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Session Complete</Text>
                <Text>Total adhkar: {totalDhikrCount}</Text>
                <Text>Total repetitions: {totalRepetitions}</Text>
                <Text>Duration: {Math.round(elapsedMs / 1000)}s</Text>
                <Button title="Close" onPress={() => stop()} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SessionProgressBar index={currentIndex} total={totalDhikrCount} />
            <View style={styles.dhikrWrap}>
                <Text style={styles.dhikrTitle}>{currentDhikr.title || currentDhikr.section}</Text>
                <Text style={styles.dhikrText}>{currentDhikr.text}</Text>
            </View>
            <DhikrCounter
                id={`session-${currentDhikr.id}-${currentIndex}`}
                target={currentDhikr.repetitions ?? 1}
                onComplete={() => handleItemComplete()}
            />
            <View style={styles.controls}>
                {paused ? <Button title="Resume" onPress={() => resume()} /> : <Button title="Pause" onPress={() => pause()} />}
                <Button title="Skip" onPress={() => next()} />
            </View>
            <Text style={styles.footer}>Elapsed: {Math.round(elapsedMs / 1000)}s</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, alignItems: 'center' },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    dhikrWrap: { marginVertical: 12, alignItems: 'center' },
    dhikrTitle: { fontWeight: '700', fontSize: 16 },
    dhikrText: { fontSize: 20, marginTop: 8 },
    controls: { flexDirection: 'row', marginTop: 12, width: '80%', justifyContent: 'space-between' },
    footer: { marginTop: 8, color: '#666' },
});