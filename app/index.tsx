import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Cairo_700Bold } from "@expo-google-fonts/cairo";

export default function Intro() {
  const router = useRouter();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const [fontsLoaded] = useFonts({
    Cairo_700Bold,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // redirect after 2.5s
    const timeout = setTimeout(() => {
      router.replace("/home"); // replace prevents going back
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.text,
          { opacity, transform: [{ scale }] },
        ]}
      >
        الله أكبر
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    fontSize: 44,
    fontFamily: "Cairo_700Bold",
  },
});