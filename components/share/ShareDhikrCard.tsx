import { NormalizedContentItem } from '@/types';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useRef } from 'react';
import { Button, Platform, Share, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

type Props = {
    dhikr: NormalizedContentItem;
};

export const ShareDhikrCard: React.FC<Props> = ({ dhikr }) => {
    const viewRef = useRef<any>(null);

    const captureAndShare = async (format: 'square' | 'story') => {
        try {
            if (Platform.OS === 'web') {
                await Share.share({ message: `${dhikr.text}\n\n${dhikr.title || dhikr.section}` });
                return;
            }

            const uri = await viewRef.current.capture();
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) {
                throw new Error('Cache directory unavailable');
            }

            if (format === 'square') {
                const dest = `${cacheDir}dhikr_${dhikr.id}.png`;
                await FileSystem.copyAsync({ from: uri, to: dest });
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(dest);
                } else {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status === 'granted') {
                        await MediaLibrary.saveToLibraryAsync(dest);
                    }
                }
            } else {
                // story (taller) - same approach
                const dest = `${cacheDir}dhikr_${dhikr.id}_story.png`;
                await FileSystem.copyAsync({ from: uri, to: dest });
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(dest);
                } else {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status === 'granted') {
                        await MediaLibrary.saveToLibraryAsync(dest);
                    }
                }
            }
        } catch (e) {
            console.warn('Share failed', e);
        }
    };

    return (
        <>
            <ViewShot ref={viewRef} options={{ format: 'png', quality: 0.95 }}>
                <LinearGradient colors={['#FFDEE9', '#B5FFFC']} style={styles.card}>
                    <Text style={styles.section}>{dhikr.section}</Text>
                    <Text style={styles.text}>{dhikr.text}</Text>
                    <Text style={styles.brand}>Nabd</Text>
                </LinearGradient>
            </ViewShot>
            <View style={styles.actions}>
                <Button title="Share (Square)" onPress={() => captureAndShare('square')} />
                <Button title="Share (Story)" onPress={() => captureAndShare('story')} />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    card: { width: 800, height: 800, padding: 24, justifyContent: 'center', alignItems: 'center' },
    section: { position: 'absolute', top: 20, left: 20, fontSize: 14, color: '#333' },
    text: { fontSize: 28, textAlign: 'center', paddingHorizontal: 20, color: '#111' },
    brand: { position: 'absolute', bottom: 16, right: 16, fontSize: 12, color: '#444' },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});