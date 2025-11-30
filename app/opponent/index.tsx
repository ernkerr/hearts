import React, { useEffect, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { useFocusEffect, useRouter, Stack } from "expo-router";
import { Box } from "../../src/components/ui/box";
import { Text } from "../../src/components/ui/text";
import { Button, ButtonText } from "../../src/components/ui/button";
import { Avatar, AvatarFallbackText } from "../../src/components/ui/avatar";
import {
  getOpponents,
  getHasPaid,
  getUserName,
  Opponent,
  setHasPaid,
} from "../../src/utils/mmkvStorage";
import { SettingsIcon } from "lucide-react-native";
import BuyButton from "@/src/components/BuyButton";
import PaywallModal from "../../src/components/PaywallModal";
// This is the main screen that lists all opponents, now at /opponent
export default function OpponentsScreen() {
  const router = useRouter();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [hasPaid, setHasPaidState] = useState(false);
  const [userName, setUserName] = useState("You");
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Load opponents and payment status when the screen loads
  useFocusEffect(
    React.useCallback(() => {
      setOpponents(getOpponents());
      setHasPaidState(getHasPaid());
      setUserName(getUserName());
    }, [])
  );

  function handleAddOpponent() {
    if (!hasPaid && opponents.length >= 1) {
      setShowPaywallModal(true);
      return;
    }
    router.push("/opponent/new");
  }

  function handleOpponentPress(id: string) {
    router.push(`/opponent/${id}`);
  }

  function handleSettings() {
    router.push("/settings");
  }

  const renderOpponent = ({ item }: { item: Opponent }) => (
    <Pressable
      className="flex-row items-center bg-white rounded-2xl border-2 border-black p-4 mb-8"
      onPress={() => handleOpponentPress(item.id)}
      style={{ boxShadow: "4px 4px 0px #000" }}
    >
      <Avatar
        size="md"
        className="mr-4 border-2 border-black"
        style={{
          backgroundColor: item.color || "#fff",
          boxShadow: "2px 2px 0px #000",
        }}
      >
        <AvatarFallbackText style={{ fontFamily: "Card", color: "#000" }}>
          {item.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </AvatarFallbackText>
      </Avatar>
      <Box className="flex-1 p-2">
        <Text
          className="text-black text-lg font-bold"
          style={{ fontFamily: "SpaceMonoRegular", fontSize: 18 }}
        >
          {item.name}
        </Text>
        <Text
          className="text-gray-500 mt-1"
          style={{ fontFamily: "SpaceMonoRegular" }}
        >
          Games: {item.games.length}
        </Text>
      </Box>
    </Pressable>
  );

  return (
    <>
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        message="You can only have one opponent for free. Pay to unlock unlimited opponents!"
        onSuccess={() => {
          setHasPaidState(true);
          setShowPaywallModal(false);
        }}
      />
      {/* Set the screen title to 'Opponents' */}
      <Stack.Screen
        options={{
          title: "Opponents",
          headerTitleStyle: {
            fontFamily: "SpaceMono",
            fontSize: 20,
          },
          headerLeft: () => null,
          headerRight: () => (
            <Pressable onPress={handleSettings} className="mr-4">
              <SettingsIcon size={24} color="#000" />
            </Pressable>
          ),
        }}
      />
      <Box className="flex-1 bg-gray-50">
        {/* List */}
        <FlatList
          data={opponents}
          renderItem={renderOpponent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          ListEmptyComponent={
            <Text
              className="p-8 text-center  text-gray-600"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              No opponents yet. Add an opponent to start tracking games!
            </Text>
          }
        />
        {/* Actions */}
        <Box className="p-4 border-t border-gray-200 bg-white">
          <Button
            size="xl"
            action="primary"
            variant="solid"
            onPress={handleAddOpponent}
            className="mb-6"
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <ButtonText className="text-white">Add New Opponent</ButtonText>
          </Button>
        </Box>
      </Box>
    </>
  );
}
