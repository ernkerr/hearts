import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, ButtonText } from "../src/components/ui/button";
import { Input, InputField } from "../src/components/ui/input";
import {
  getUserName,
  setUserName,
  getGinValue,
  setGinValue,
  getBigGinValue,
  setBigGinValue,
  getUndercutValue,
  setUndercutValue,
  getTargetScore,
  setTargetScore,
  storage,
} from "../src/utils/mmkvStorage";
import { Stack, useRouter } from "expo-router";
import { Box } from "@/src/components/ui/box";

import * as RNIap from "react-native-iap";
import RestoreButton from "@/src/components/RestoreButton";

const validProductId = "gin_premium_ios";

// This screen lets the user view and change their name
export default function SettingsScreen() {
  const router = useRouter();
  // State to hold the user's name
  const [name, setName] = useState("");
  // State to hold bonus values
  const [gin, setGin] = useState(25);
  const [bigGin, setBigGin] = useState(31);
  const [undercut, setUndercut] = useState(25);
  const [targetScore, setTargetScoreState] = useState(100);

  // Load the user's name and bonus values when the screen loads
  useEffect(() => {
    setName(getUserName());
    setGin(getGinValue());
    setBigGin(getBigGinValue());
    setUndercut(getUndercutValue());
    setTargetScoreState(getTargetScore());
  }, []);

  // Handler for saving the new name and bonus values
  function handleSave() {
    setUserName(name.trim() || "You");
    setGinValue(gin);
    setBigGinValue(bigGin);
    setUndercutValue(undercut);
    setTargetScore(targetScore);
    router.back();
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
            fontFamily: "SpaceMono",
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
                style={{ fontFamily: "SpaceMonoRegular" }}
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

            {/* Bonus Value Inputs */}
            <Box className=" rounded-lg p-4 pt-2 ">
              {/* Default Target Score Input */}
              <Text
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                Default Target Score
              </Text>
              <Input
                variant="outline"
                size="md"
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
            <Box className=" rounded-lg p-4 pt-2 mb-4">
              <Text
                className="text-lg font-semibold"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                Gin Bonus
              </Text>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                className="mb-2"
                style={{
                  boxShadow: "4px 4px 0px #000",
                }}
              >
                <InputField
                  placeholder="Gin Bonus"
                  value={gin.toString()}
                  onChangeText={(v: string) =>
                    setGin(Number(v.replace(/[^0-9]/g, "")))
                  }
                  keyboardType="numeric"
                  style={{ fontFamily: "SpaceMonoRegular" }}
                />
              </Input>
              <Text
                className="text-lg font-semibold"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                Big Gin Bonus
              </Text>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                className="mb-2"
                style={{
                  boxShadow: "4px 4px 0px #000",
                }}
              >
                <InputField
                  placeholder="Big Gin Bonus"
                  value={bigGin.toString()}
                  onChangeText={(v: string) =>
                    setBigGin(Number(v.replace(/[^0-9]/g, "")))
                  }
                  keyboardType="numeric"
                  style={{ fontFamily: "SpaceMonoRegular" }}
                />
              </Input>
              <Text
                className="text-lg font-semibold"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                Undercut Bonus
              </Text>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                className="mb-2"
                style={{
                  boxShadow: "4px 4px 0px #000",
                }}
              >
                <InputField
                  placeholder="Undercut Bonus"
                  value={undercut.toString()}
                  onChangeText={(v: string) =>
                    setUndercut(Number(v.replace(/[^0-9]/g, "")))
                  }
                  keyboardType="numeric"
                  style={{ fontFamily: "SpaceMonoRegular" }}
                />
              </Input>
            </Box>

            {/* Restore purchase */}
            <RestoreButton />

            {/* Save */}
            <View className="flex-row mt-2">
              <Button
                size="lg"
                onPress={handleSave}
                className="flex-1"
                style={{
                  boxShadow: "4px 4px 0px #000",
                }}
              >
                <ButtonText className="text-white">Save</ButtonText>
              </Button>
            </View>

            {/* Button to clear AsyncStorage */}
            <Button
              size="sm"
              onPress={handleClearStorage}
              // TODO: Add disabled state when paywall is implemented
              // disabled={!hasPaid}
              className="mt-[90%] mb-16 bg-white w-[50%] ml-[25%] "
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
