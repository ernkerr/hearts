import { useFonts } from "expo-font";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

const { width } = Dimensions.get("window");

type Props = {
  onAnimationFinish?: () => void;
};

export default function Splash({ onAnimationFinish }: Props) {
  const lottieRef = useRef<LottieView>(null);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasFinished) {
        setHasFinished(true);
        if (onAnimationFinish) {
          onAnimationFinish();
        }
      }
    }, 2000); // 2500ms - 500ms = 2000ms
    return () => clearTimeout(timer);
  }, [hasFinished, onAnimationFinish]);

  const handleAnimationFinish = () => {
    if (!hasFinished) {
      setHasFinished(true);
      if (onAnimationFinish) {
        onAnimationFinish();
      }
    }
  };

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <LottieView
        style={{
          width: width * 0.9,
          aspectRatio: 1,
        }}
        source={require("../../assets/Splash.json")}
        autoPlay
        loop={false}
        onAnimationFinish={handleAnimationFinish}
      />
    </Animated.View>
  );
}
