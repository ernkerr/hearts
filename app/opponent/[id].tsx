import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";

import {
  useRouter,
  useLocalSearchParams,
  Stack,
  useFocusEffect,
} from "expo-router";
import { Button, ButtonText } from "../../src/components/ui/button";
import {
  getOpponents,
  getUserName,
  getHasPaid,
  Opponent,
  Game,
} from "../../src/utils/mmkvStorage";
import { Crown } from "lucide-react-native";
import { getTotalScore } from "../../src/utils/gameLogic";
import { Avatar, AvatarFallbackText } from "../../src/components/ui/avatar";
import PaywallModal from "../../src/components/PaywallModal";
// Helper to format time ago
function timeAgo(dateString: string | undefined): string {
  if (!dateString) return "Never";
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2419200) return `${Math.floor(diff / 604800)} weeks ago`;
  return date.toLocaleDateString();
}

// This screen shows the details for a single opponent
export default function OpponentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the opponent ID from the route
  // State for the opponent
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  // Add a loading state to distinguish between initial load and missing opponent
  const [loading, setLoading] = useState(true);
  // State for the user's name
  const [userName, setUserName] = useState("You");
  // State for paywall
  const [hasPaid, setHasPaid] = useState(false);
  // State for showing paywall modal
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  // Stats
  const [userTotalPoints, setUserTotalPoints] = useState(0);
  const [opponentTotalPoints, setOpponentTotalPoints] = useState(0);
  const [userWins, setUserWins] = useState(0);
  const [opponentWins, setOpponentWins] = useState(0);

  // Load opponent and stats when the screen loads or id changes
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setHasPaid(await getHasPaid());
        setUserName(await getUserName());
        // Find the opponent by id
        const allOpponents = await getOpponents();
        const found = allOpponents.find((o) => o.id === id);
        setOpponent(found || null);
        setLoading(false);
        if (found) {
          // Calculate total points and wins for user and opponent using utility
          let userPoints = 0,
            oppPoints = 0,
            userW = 0,
            oppW = 0;
          found.games.forEach((game: Game) => {
            userPoints += getTotalScore(game.scoreHistory, "user");
            oppPoints += getTotalScore(game.scoreHistory, "opponent");
            if (game.winner === "user") userW++;
            if (game.winner === "opponent") oppW++;
          });
          setUserTotalPoints(userPoints);
          setOpponentTotalPoints(oppPoints);
          setUserWins(userW);
          setOpponentWins(oppW);
        }
      })();
    }, [id])
  );

  // Redirect if opponent is missing after loading
  useEffect(() => {
    if (!loading && opponent === null) {
      router.replace("/opponent");
    }
  }, [loading, opponent, router]);

  // Handler for starting a new game
  function handleStartGame() {
    if (!hasPaid && opponent && opponent.games.length >= 1) {
      setShowPaywallModal(true);
      return;
    }
    router.push(`/game/new?opponentId=${id}`);
  }

  // Handler for clicking a game
  function handleGamePress(gameId: string) {
    router.push(`/game/${gameId}`);
  }

  if (loading) return <Text>Loading...</Text>;
  if (!opponent) return null;

  return (
    <>
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        message="You can only have one game for free. Pay to unlock unlimited games!"
        onSuccess={async () => {
          setHasPaid(true);
          setShowPaywallModal(false);
          handleStartGame();
        }}
      />
      {/* Set the screen title to the opponent's name dynamically */}
      <Stack.Screen
        options={{
          title: opponent ? opponent.name : "Opponent",
          headerTitleStyle: {
            fontFamily: "SpaceMono",
          },
        }}
      />
      <View className="flex-1 bg-white ">
        {/* Opponent avatar, name and stats */}
        <View className="items-center pt-[24px]">
          <Pressable onPress={() => router.push(`/opponent/${id}/edit`)}>
            <Avatar
              size="xl"
              className="border-2 border-black"
              style={{
                backgroundColor: opponent.color || "#fff",
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <AvatarFallbackText
                style={{
                  fontFamily: "Card",
                  color: "#000",
                }}
              >
                {opponent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallbackText>
            </Avatar>
          </Pressable>
          <Text
            className="text-2xl font-bold mt-2 mb-[-20px]"
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            {opponent.name}
          </Text>
        </View>
        {/* Opponent name and stats */}
        <View className="border-b-2 border-gray-200 ">
          {/* total scores */}
          <View className="flex-row justify-between mx-20 pb-2">
            <View className="items-center">
              <View style={{ height: 20 }}>
                {userTotalPoints > opponentTotalPoints && (
                  <Crown size={24} color="black" />
                )}
              </View>
              <Text
                className="text-lg font-semibold"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                {userName}
              </Text>
              <Text
                className="text-3xl font-bold"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                {userTotalPoints}
              </Text>
            </View>
            <View className="items-center">
              <View style={{ height: 20 }}>
                {opponentTotalPoints > userTotalPoints && (
                  <Crown size={24} color="black" />
                )}
              </View>
              <Text
                className="text-lg font-semibold"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                {opponent.name}
              </Text>
              <Text
                className="text-3xl font-bold"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                {opponentTotalPoints}
              </Text>
            </View>
          </View>
        </View>
        {/* Continue game button */}

        {/* List of games for this opponent */}
        <FlatList
          data={[...opponent.games].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isInProgress = !item.winner;
            // Find last played date
            const lastRound = item.scoreHistory[item.scoreHistory.length - 1];
            const lastPlayed = lastRound ? lastRound.date : undefined;

            return (
              <Button
                size="xl"
                action="primary"
                variant="solid"
                onPress={() => handleGamePress(item.id)}
                style={{
                  boxShadow: isInProgress
                    ? "4px 4px 0px #000"
                    : "4px 4px 0px #D1D5DB",
                }}
                className={`flex-row items-center justify-between m-2 h-20 ${
                  isInProgress
                    ? "  bg-green-500   "
                    : "  bg-white  border-gray-300 "
                }`}
              >
                <View>
                  <Text
                    style={{ fontFamily: "SpaceMonoRegular" }}
                    className={`text-xl font-semibold ${
                      isInProgress ? "text-white" : ""
                    }`}
                  >
                    {item.winner
                      ? item.winner === "user"
                        ? `${userName} won`
                        : `${opponent.name} won`
                      : "Continue Game"}
                  </Text>
                  <Text
                    style={{ fontFamily: "SpaceMonoRegular" }}
                    className={isInProgress ? "text-white " : "text-gray-500 "}
                  >
                    {item.scoreHistory.length > 0
                      ? `Last played: ${timeAgo(lastPlayed)}`
                      : "No rounds played yet"}
                  </Text>
                </View>
                {isInProgress && (
                  <Text className="text-white text-3xl ml-4">›</Text>
                )}
              </Button>
            );
          }}
          ListEmptyComponent={
            <Text
              className="p-4 text-center text-gray-500"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              No games yet. Start one below!
            </Text>
          }
        />
        {/* Start new game button */}
        <View className="p-4 border-t border-gray-200 ">
          <Button
            size="xl"
            action="primary"
            variant="solid"
            onPress={handleStartGame}
            className="mb-6 "
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <ButtonText className="text-white">Start New Game</ButtonText>
          </Button>
        </View>
      </View>
    </>
  );
}
