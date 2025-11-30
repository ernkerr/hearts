import React, { useState } from "react";
import { View, Text, Alert, Pressable, ScrollView } from "react-native";
import { Button, ButtonText } from "../../src/components/ui/button";
import { Input, InputField } from "../../src/components/ui/input";
import { useRouter, Stack } from "expo-router";
import {
  getOpponents,
  saveOpponents,
  generateId,
  getHasPaid,
} from "../../src/utils/mmkvStorage";
import { Box } from "../../src/components/ui/box";
import {
  ColorPicker,
  COLOR_PICKER_PALETTE,
} from "../../src/components/ui/ColorPicker";
import PaywallModal from "../../src/components/PaywallModal";

// This screen lets the user add a new opponent
export default function NewOpponentScreen() {
  const router = useRouter();
  // State to hold the new opponent's name
  const [name, setName] = useState("");
  // State to show loading while saving
  const [loading, setLoading] = useState(false);
  // State for selected color
  const [color, setColor] = useState<string>(COLOR_PICKER_PALETTE[0]);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Handler for creating a new opponent
  function handleCreateOpponent() {
    // Don't allow empty names
    if (!name.trim()) return;
    // Enforce free limit: only one opponent if not paid
    const opponents = getOpponents();
    if (!getHasPaid() && opponents.length >= 1) {
      setShowPaywallModal(true);
      return;
    }
    setLoading(true);
    // Create the new opponent object
    const newOpponent = {
      id: generateId(),
      name: name.trim(),
      games: [],
      color, // Save selected color
    };
    // Save the new opponent to storage
    saveOpponents([...opponents, newOpponent]);
    // Debug: log all opponents after saving
    const allOpponents = getOpponents();
    console.log("Opponents after save:", allOpponents);
    setLoading(false);
    // Navigate to the new opponent's detail page
    router.replace(`/opponent/${newOpponent.id}`);
  }

  return (
    <>
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        message="You can only have one opponent for free. Pay to unlock unlimited opponents!"
        onSuccess={handleCreateOpponent}
      />
      <Stack.Screen
        options={{
          title: "Add Opponent",
          headerTitleStyle: {
            fontFamily: "SpaceMono",
          },
        }}
      />
      <ScrollView className="flex-1 p-4 bg-white ">
        {/* Input for the opponent's name */}
        <Box className="rounded-lg p-4 mb-4">
          <Text
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            Opponent Name
          </Text>
          <Input
            variant="outline"
            size="lg"
            isDisabled={loading}
            isInvalid={false}
            isReadOnly={false}
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <InputField
              placeholder="Or nickname"
              value={name}
              onChangeText={setName}
              style={{ fontFamily: "SpaceMonoRegular" }}
            />
          </Input>
          {/* Color Picker: 3 rows of 5, centered, evenly spaced */}
          <Text
            className="mt-6 text-lg "
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            Select Color
          </Text>
          <ColorPicker selectedColor={color} onSelect={setColor} />
        </Box>
        {/* Buttons for cancel and create */}
        <View className="flex-row mt-6 gap-4">
          <Button
            size="lg"
            action="secondary"
            onPress={() => router.back()}
            disabled={loading}
            className="flex-1"
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <ButtonText className="text-black">Cancel</ButtonText>
          </Button>
          <Button
            size="lg"
            onPress={handleCreateOpponent}
            disabled={loading || !name.trim()}
            className="flex-1"
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <ButtonText className="text-white text-center">
              Create Opponent
            </ButtonText>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
