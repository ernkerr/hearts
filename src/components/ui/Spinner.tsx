import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";

export function Spinner() {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]}>
      <View style={styles.dot} />
      <View style={[styles.dot, styles.dotLeft]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spinner: {
    width: 36,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000",
    left: 12,
    top: 0,
    shadowColor: "#26ABFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  dotLeft: {
    left: -12,
  },
});
