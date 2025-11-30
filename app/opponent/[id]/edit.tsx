import React, { useEffect, useState } from "react";
import { View, Text, Alert, Pressable } from "react-native";
import { Button, ButtonText } from "../../../src/components/ui/button";
import { Input, InputField } from "../../../src/components/ui/input";
import {
  ColorPicker,
  COLOR_PICKER_PALETTE,
} from "../../../src/components/ui/ColorPicker";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import {
  getOpponents,
  saveOpponents,
  Opponent,
} from "../../../src/utils/mmkvStorage";

export default function EditOpponentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [name, setName] = useState("");

  const [color, setColor] = useState<string>(COLOR_PICKER_PALETTE[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const opponents = getOpponents();
    const opp = opponents.find((o) => o.id === id);
    if (opp) {
      setName(opp.name);
      setColor(opp.color || COLOR_PICKER_PALETTE[0]);
    }
  }, [id]);

  function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    const opponents = getOpponents();
    const idx = opponents.findIndex((o) => o.id === id);
    if (idx === -1) {
      Alert.alert("Error", "Opponent not found.");
      setLoading(false);
      return;
    }
    opponents[idx] = {
      ...opponents[idx],
      name: name.trim(),
      color,
    };
    saveOpponents(opponents);
    setLoading(false);
    router.back();
  }

  function handleDelete() {
    Alert.alert(
      "Delete Opponent",
      "Are you sure you want to delete this opponent? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setLoading(true);
            const opponents = getOpponents();
            const newOpponents = opponents.filter((o) => o.id !== id);
            saveOpponents(newOpponents);
            setLoading(false);
            router.replace("/");
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Opponent" }} />
      <View className="flex-1 p-4 bg-white ">
        <Text className="text-2xl font-bold mb-6">Edit Opponent</Text>
        {/* Input for the opponent's name */}
        <Input
          variant="outline"
          size="lg"
          isDisabled={loading}
          isInvalid={false}
          isReadOnly={false}
        >
          <InputField
            placeholder="Opponent Name"
            value={name}
            onChangeText={setName}
          />
        </Input>
        {/* Color Picker */}
        <Text className="mt-6 mb-2 text-base font-semibold">Select Color</Text>
        <ColorPicker selectedColor={color} onSelect={setColor} />
        {/* Delete Opponent Button */}
        <View className="mt-8 mb-16">
          <Button
            size="lg"
            action="secondary"
            onPress={handleDelete}
            disabled={loading}
            className="border border-red-600"
            style={{
              boxShadow: "4px 4px 0px #dc2626",
              backgroundColor: "#fff",
            }}
          >
            <ButtonText className="text-red-600">Delete Opponent</ButtonText>
          </Button>
        </View>
        {/* Buttons for cancel and save */}
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
            onPress={handleSave}
            disabled={loading || !name.trim()}
            className="flex-1"
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <ButtonText className="text-white">Save</ButtonText>
          </Button>
        </View>
      </View>
    </>
  );
}
