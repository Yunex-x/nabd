import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
// use expo-sensors magnetometer and location
// import { Magnetometer } from 'expo-sensors';

export default function QiblaCompass() {
  // TODO: read device heading and compute bearing to Kaaba using user coords
  const [heading, setHeading] = useState(0);
  const [qiblaBearing, setQiblaBearing] = useState(0);

  useEffect(() => {
    // subscribe to magnetometer/heading updates and compute difference with qiblaBearing
  }, []);

  return (
    <View>
      <Text>Qibla Compass</Text>
      {/* render an arrow rotated by heading - qiblaBearing */}
    </View>
  );
}