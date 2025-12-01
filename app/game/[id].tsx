import React, { useEffect, useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { Pressable, ScrollView } from "react-native";
import { calculateWinner, getAllPlayerTotals } from "../../src/utils/gameLogic";
import {
  getGameById,
  updateGame,
  type Game,
  type Round,
} from "../../src/utils/mmkvStorage";

//ui
import LottieView from "lottie-react-native";
import { Crown, Pencil } from "lucide-react-native";
import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { Button, ButtonText } from "../../src/components/ui/button";
import { Avatar, AvatarFallbackText } from "../../src/components/ui/avatar";
import { MultiPlayerScoreModal } from "../../src/components/MultiPlayerScoreModal";

// Game detail screen showing scoreboard and rounds
export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [editRoundIndex, setEditRoundIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load game data
  useEffect(() => {
    if (typeof id === "string") {
      const foundGame = getGameById(id);
      setGame(foundGame);

      // Show confetti if game just completed
      if (foundGame?.status === "completed" && !showConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [id]);

  // Handler for adding or editing a round
  function handleSaveRound(
    scores: { [playerId: string]: number },
    bonusType?: "queenOfSpades" | "shootMoon" | null,
    bonusPlayerId?: string
  ) {
    if (!game) return;

    const newRound: Round = {
      date: new Date().toISOString(),
      scores,
      bonusType: bonusType || null,
      bonusPlayerId: bonusPlayerId || undefined,
    };

    let updatedRounds: Round[];
    if (editRoundIndex !== null) {
      // Editing existing round
      updatedRounds = [...game.rounds];
      updatedRounds[editRoundIndex] = newRound;
    } else {
      // Adding new round
      updatedRounds = [...game.rounds, newRound];
    }

    // Calculate winner
    const winnerId = calculateWinner(updatedRounds, game.players, game.targetScore);
    const newStatus = winnerId ? "completed" : "in_progress";

    // Update game
    const updatedGame: Game = {
      ...game,
      rounds: updatedRounds,
      winner: winnerId,
      status: newStatus,
    };

    updateGame(game.id, updatedGame);
    setGame(updatedGame);
    setScoreModalVisible(false);
    setEditRoundIndex(null);

    // Show confetti if game just completed
    if (winnerId && newStatus === "completed") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }

  function handleAddRound() {
    setEditRoundIndex(null);
    setScoreModalVisible(true);
  }

  function handleEditRound(index: number) {
    setEditRoundIndex(index);
    setScoreModalVisible(true);
  }

  if (!game) {
    return (
      <Box className="flex-1 justify-center items-center bg-gray-100">
        <Text style={{ fontFamily: "SpaceMonoRegular" }}>Game not found</Text>
      </Box>
    );
  }

  const playerTotals = getAllPlayerTotals(game.rounds, game.players);
  const lowestScore = Math.min(...Object.values(playerTotals));
  const winnerPlayer = game.winner
    ? game.players.find((p) => p.id === game.winner)
    : null;

  const editRound = editRoundIndex !== null ? game.rounds[editRoundIndex] : undefined;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Game",
          headerTitleStyle: { fontFamily: "SpaceMono" },
        }}
      />

      <MultiPlayerScoreModal
        visible={scoreModalVisible}
        onClose={() => {
          setScoreModalVisible(false);
          setEditRoundIndex(null);
        }}
        onSave={handleSaveRound}
        players={game.players}
        editRoundScores={editRound?.scores}
        editBonusType={editRound?.bonusType}
        editBonusPlayerId={editRound?.bonusPlayerId}
        editRoundIndex={editRoundIndex}
      />

      <Box className="flex-1 bg-gray-100">
        {/* Confetti Animation */}
        {showConfetti && game.status === "completed" && (
          <LottieView
            source={require("../../assets/animations/confetti.json")}
            autoPlay
            loop={false}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              pointerEvents: "none",
            }}
          />
        )}

        <ScrollView className="flex-1">
          {/* Scoreboard Header */}
          <Box className="bg-white border-b-2 border-black p-6">
            <Text
              className="text-center mb-4"
              style={{ fontFamily: "Card", fontSize: 20 }}
            >
              Scoreboard
            </Text>

            <Box className="flex-row justify-around flex-wrap">
              {game.players.map((player) => {
                const total = playerTotals[player.id] || 0;
                const isLeader = total === lowestScore && game.rounds.length > 0;

                return (
                  <Box key={player.id} className="items-center mb-4" style={{ width: 80 }}>
                    <Avatar
                      size="md"
                      className="border-2 border-black mb-2"
                      style={{
                        backgroundColor: player.color,
                        boxShadow: "2px 2px 0px #000",
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

                    <Text
                      className="text-center text-sm mb-1"
                      style={{ fontFamily: "SpaceMonoRegular" }}
                      numberOfLines={1}
                    >
                      {player.name}
                    </Text>

                    <Box className="flex-row items-center">
                      {isLeader && <Crown size={14} color="#FFD700" style={{ marginRight: 4 }} />}
                      <Text
                        className="font-bold text-lg"
                        style={{ fontFamily: "Card" }}
                      >
                        {total}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Winner Message */}
          {game.status === "completed" && winnerPlayer && (
            <Box className="bg-green-200 border-2 border-black m-6 p-4 rounded-xl" style={{ boxShadow: "4px 4px 0px #000" }}>
              <Text
                className="text-center font-bold text-xl"
                style={{ fontFamily: "Card" }}
              >
                🎉 {winnerPlayer.name} Wins! 🎉
              </Text>
              <Text
                className="text-center text-gray-700 mt-1"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                Final Score: {playerTotals[winnerPlayer.id]}
              </Text>
            </Box>
          )}

          {/* Rounds List */}
          <Box className="p-6">
            <Text
              className="font-bold text-xl mb-4"
              style={{ fontFamily: "Card" }}
            >
              Rounds ({game.rounds.length})
            </Text>

            {game.rounds.length === 0 ? (
              <Box className="bg-white border-2 border-black rounded-xl p-8" style={{ boxShadow: "4px 4px 0px #000" }}>
                <Text
                  className="text-center text-gray-500"
                  style={{ fontFamily: "SpaceMonoRegular" }}
                >
                  No rounds yet. Add your first round!
                </Text>
              </Box>
            ) : (
              game.rounds.map((round, index) => (
                <Box
                  key={index}
                  className="bg-white border-2 border-black rounded-xl p-4 mb-4"
                  style={{ boxShadow: "4px 4px 0px #000" }}
                >
                  <Box className="flex-row justify-between items-center mb-3">
                    <Text style={{ fontFamily: "Card", fontSize: 16 }}>
                      Round {index + 1}
                    </Text>
                    <Pressable onPress={() => handleEditRound(index)}>
                      <Pencil size={20} color="#000" />
                    </Pressable>
                  </Box>

                  {/* Scores for each player */}
                  <Box className="flex-row flex-wrap">
                    {game.players.map((player) => (
                      <Box
                        key={player.id}
                        className="flex-row items-center mr-4 mb-2"
                      >
                        <Box
                          className="w-4 h-4 rounded-full border border-black mr-1"
                          style={{ backgroundColor: player.color }}
                        />
                        <Text style={{ fontFamily: "SpaceMonoRegular", fontSize: 14 }}>
                          {player.name.split(" ")[0]}: {round.scores[player.id] || 0}
                        </Text>
                      </Box>
                    ))}
                  </Box>

                  {/* Bonus indicator */}
                  {round.bonusType && (
                    <Text
                      className="text-sm text-gray-600 mt-2"
                      style={{ fontFamily: "SpaceMonoRegular" }}
                    >
                      {round.bonusType === "queenOfSpades" && "♠️ Queen of Spades"}
                      {round.bonusType === "shootMoon" && "🌙 Shot the Moon"}
                    </Text>
                  )}
                </Box>
              ))
            )}
          </Box>
        </ScrollView>

        {/* Add Round Button */}
        {game.status === "in_progress" && (
          <Box className="p-6">
            <Button
              onPress={handleAddRound}
              className="bg-black border-2 border-black rounded-xl"
              style={{ boxShadow: "4px 4px 0px #000" }}
            >
              <ButtonText style={{ fontFamily: "Card", fontSize: 18 }}>
                Add Round
              </ButtonText>
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
