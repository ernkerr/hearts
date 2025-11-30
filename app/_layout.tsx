import { Stack } from "expo-router";
import "@/global.css";
import { GluestackUIProvider } from "../src/components/ui/gluestack-ui-provider";
import { useState, useEffect } from "react";

// import { useColorScheme } from "react-native";
import Splash from "../src/components/splash";
import { useFonts } from "expo-font";

// This is the main layout of the app
// It defines the navigation structure

// This file defines how all the pages within that directory are arranged.
// This is where you would define a stack navigator, tab navigator, drawer navigator, or any other layout that you want to use for the pages in that directory.

export default function RootLayout() {
  // const colorScheme = useColorScheme();
  const [isSplashComplete, setSplashComplete] = useState(false);
  const [fontsLoaded] = useFonts({
    Card: require("../assets/fonts/Card.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Bold.ttf"),
    SpaceMonoRegular: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  if (!isSplashComplete) {
    return (
      <GluestackUIProvider mode="light">
        <Splash onAnimationFinish={() => setSplashComplete(true)} />
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </GluestackUIProvider>
  );
}
