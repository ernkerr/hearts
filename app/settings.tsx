import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import Constants from "expo-constants";
import { Button, ButtonText } from "../src/components/ui/button";
import { Input, InputField } from "../src/components/ui/input";
import {
  getUserName,
  setUserName,
  getTargetScore,
  setTargetScore,
  storage,
} from "../src/utils/mmkvStorage";
import { Stack, useRouter } from "expo-router";
import { Box } from "@/src/components/ui/box";

import RestoreButton from "@/src/components/RestoreButton";

// This screen lets the user view and change their name
export default function SettingsScreen() {
  const router = useRouter();
  // State to hold the user's name
  const [name, setName] = useState("");
  // State to hold target score
  const [targetScore, setTargetScoreState] = useState(100);

  // Load the user's name and target score when the screen loads
  useEffect(() => {
    setName(getUserName());
    setTargetScoreState(getTargetScore());
  }, []);

  // Handler for saving the new name and target score
  function handleSave() {
    setUserName(name.trim() || "You");
    setTargetScore(targetScore);
    router.back();
  }

  // Explicit "Rate" button → open the App Store / Play Store listing directly.
  // (Apple's native StoreReview prompt is reserved for natural moments like
  // finishing a game, not button taps.)
  function handleRate() {
    const url =
      Platform.OS === "ios"
        ? Constants.expoConfig?.ios?.appStoreUrl
        : Constants.expoConfig?.android?.playStoreUrl;
    if (url) {
      Linking.openURL(url).catch(() =>
        Alert.alert("Couldn't open the store", "Please try again later.")
      );
    }
  }

  // Handler for clearing AsyncStorage
  function handleClearStorage() {
    Alert.alert(
      "Are you sure?",
      "This will delete all app data and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            storage.clearAll();
            alert("MMKV storage cleared! (restart app to see effect)");
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerTitleStyle: {
            fontFamily: "Card",
          },
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <View className="flex-1 p-4 pt-0 ">
            <Box className=" rounded-lg p-4 mb-2">
              <Text
                className="text-lg font-semibold mb-2 "
                style={{ fontFamily: "Card" }}
              >
                Name
              </Text>
              <Input
                size="lg"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                style={{
                  boxShadow: "4px 4px 0px #000",
                }}
              >
                <InputField
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  style={{ fontFamily: "SpaceMonoRegular" }}
                />
              </Input>
            </Box>

            {/* Target Score Input */}
            <Box className=" rounded-lg p-4 pt-2 mb-24">
              <Text
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: "Card" }}
              >
                Default Target Score
              </Text>
              <Input
                size="lg"
                isDisabled={false}
                className="mb-2"
                style={{
                  boxShadow: "4px 4px 0px #000",
                }}
              >
                <InputField
                  placeholder="Default Target Score"
                  value={targetScore.toString()}
                  onChangeText={(v: string) =>
                    setTargetScoreState(Number(v.replace(/[^0-9]/g, "")))
                  }
                  keyboardType="numeric"
                  style={{ fontFamily: "SpaceMonoRegular" }}
                />
              </Input>
            </Box>

            {/* Restore purchase */}
            <RestoreButton />

            {/* Rate the app */}
            <Button
              size="2xl"
              onPress={handleRate}
              className="w-full mt-8"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-white">Rate the app</ButtonText>
            </Button>

            {/* Save */}
            <Button
              size="2xl"
              onPress={handleSave}
              className="w-full mt-8 mb-28"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-white">Save</ButtonText>
            </Button>

            {/* Button to clear AsyncStorage */}
            <Button
              size="sm"
              onPress={handleClearStorage}
              // TODO: Add disabled state when paywall is implemented
              // disabled={!hasPaid}
              className="mt-[95%] mb-16 bg-white w-[50%] ml-[25%] "
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-black">Reset App</ButtonText>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
