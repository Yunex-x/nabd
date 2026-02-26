import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/home.styles";

type IoniconName = keyof typeof Ionicons.glyphMap;

function IconBadge({ name, bg }: { name: IoniconName; bg: string }) {
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Ionicons name={name} size={18} color="#111827" />
        </View>
    );
}

export default function MenuCard({
    title,
    subtitle,
    icon,
    badgeBg,
    onPress,
}: {
    title: string;
    subtitle: string;
    icon: IoniconName;
    badgeBg: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}
        >
            <IconBadge name={icon} bg={badgeBg} />
            <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSub}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-back" size={18} color="#9CA3AF" />
        </Pressable>
    );
}