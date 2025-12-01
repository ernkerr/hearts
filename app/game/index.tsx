import React, { useState } from "react";
import { FlatList, Pressable } from "react-native";
import { useFocusEffect, useRouter, Stack } from "expo-router";
import { Box } from "../../src/components/ui/box";
import { Text } from "../../src/components/ui/text";
import { Button, ButtonText } from "../../src/components/ui/button";
import { Avatar, AvatarFallbackText } from "../../src/components/ui/avatar";
import {
  getGames,
  getHasPaid,
  getUserName,
  type Game,
} from "../../src/utils/mmkvStorage";
import { SettingsIcon } from "lucide-react-native";
import PaywallModal from "../../src/components/PaywallModal";

// Main screen that lists all games (replaces opponents list)
export default function GamesScreen() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [hasPaid, setHasPaidState] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Load games when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const allGames = getGames();
      // Sort by most recent
      const sorted = [...allGames].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setGames(sorted);
      setHasPaidState(getHasPaid());
    }, [])
  );

  function handleStartNewGame() {
    // Paywall: free users can only have 1 game
    if (!hasPaid && games.length >= 1) {
      setShowPaywallModal(true);
      return;
    }
    router.push("/game/new");
  }

  function handleGamePress(id: string) {
    router.push(`/game/${id}`);
  }

  function handleSettings() {
    router.push("/settings");
  }

  const renderGame = ({ item }: { item: Game }) => {
    // Determine game status
    const isInProgress = item.status === "in_progress";
    const statusText = isInProgress
      ? "Continue Game"
      : `Winner: ${
          item.players.find((p) => p.id === item.winner)?.name || "Unknown"
        }`;

    // Format date
    const gameDate = new Date(item.date);
    const now = new Date();
    const diffHours = (now.getTime() - gameDate.getTime()) / (1000 * 60 * 60);
    let timeAgo = "";
    if (diffHours < 1) timeAgo = "Just now";
    else if (diffHours < 24) timeAgo = `${Math.floor(diffHours)}h ago`;
    else timeAgo = `${Math.floor(diffHours / 24)}d ago`;

    return (
      <Pressable
        className="bg-white rounded-2xl border-2 border-black p-4 mb-8"
        onPress={() => handleGamePress(item.id)}
        style={{
          boxShadow: "4px 4px 0px #000",
          backgroundColor: isInProgress ? "#d4edda" : "#fff",
        }}
      >
        {/* Player Avatars Row */}
        <Box className="flex-row mb-2">
          {item.players.slice(0, 5).map((player, index) => (
            <Avatar
              key={player.id}
              size="sm"
              className="border-2 border-black"
              style={{
                backgroundColor: player.color || "#fff",
                boxShadow: "2px 2px 0px #000",
                marginLeft: index > 0 ? -8 : 0,
                zIndex: item.players.length - index,
              }}
            >
              <AvatarFallbackText style={{ fontFamily: "Card", color: "#000" }}>
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallbackText>
            </Avatar>
          ))}
        </Box>

        {/* Player Names */}
        <Text
          className="text-black text-base mb-1"
          style={{ fontFamily: "SpaceMonoRegular" }}
        >
          {item.players.map((p) => p.name).join(", ")}
        </Text>

        {/* Status */}
        <Text
          className="text-black font-bold text-lg"
          style={{ fontFamily: "Card" }}
        >
          {statusText}
        </Text>

        {/* Time */}
        <Text
          className="text-gray-500 mt-1 text-sm"
          style={{ fontFamily: "SpaceMonoRegular" }}
        >
          {timeAgo}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        message="You can only have one game for free. Pay to unlock unlimited games!"
        onSuccess={() => {
          setHasPaidState(true);
          setShowPaywallModal(false);
        }}
      />

      <Stack.Screen
        options={{
          title: "Games",
          headerTitleStyle: { fontFamily: "Card" },
          headerRight: () => (
            <Pressable onPress={handleSettings} style={{ marginRight: 16 }}>
              <SettingsIcon size={24} color="#000" />
            </Pressable>
          ),
        }}
      />

      <Box className="flex-1 bg-gray-100 p-8">
        {games.length === 0 ? (
          <Box className="flex-1 justify-center items-center">
            <Text
              className="text-gray-500 text-center mb-4"
              style={{ fontFamily: "SpaceMonoRegular", fontSize: 16 }}
            >
              No games yet. Start your first game!
            </Text>
          </Box>
        ) : (
          <FlatList
            data={games}
            renderItem={renderGame}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        <Box className="absolute bottom-8 left-8 right-8">
          <Button
            onPress={handleStartNewGame}
            className="border-2 border-black rounded-xl"
            style={{ boxShadow: "4px 4px 0px #000" }}
          >
            <ButtonText style={{ fontFamily: "Card", fontSize: 18 }}>
              Start New Game
            </ButtonText>
          </Button>
        </Box>
      </Box>
    </>
  );
}
