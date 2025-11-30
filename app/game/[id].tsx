import React, { useEffect, useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { View, Text, FlatList, Pressable } from "react-native";
import { calculateWinner, getTotalScore } from "../../src/utils/gameLogic";
import {
  getOpponents,
  saveOpponents,
  getHasPaid,
  getUserName,
  Opponent,
  Game,
} from "../../src/utils/mmkvStorage";

//ui
import LottieView from "lottie-react-native";
import { Crown, Pencil, Martini, Sparkle, Scissors } from "lucide-react-native";
import { Box } from "@/src/components/ui/box";
import { KnockModal } from "../../src/components/KnockModal";
import { ScoreModal } from "../../src/components/ScoreModal";
import { Button, ButtonText } from "../../src/components/ui/button";
import PaywallModal from "@/src/components/PaywallModal";

// This screen shows the details for a single game, including all rounds and scores
export default function GameDetailScreen() {
  const { id } = useLocalSearchParams(); // game id
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [userName, setUserName] = useState("You");
  const [hasPaid, setHasPaid] = useState(false);
  // State for new round scores
  const [winner, setWinner] = useState<"user" | "opponent" | null>(null);
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  // score modal
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [editRoundIndex, setEditRoundIndex] = useState<number | null>(null);
  // knock modal
  const [knockModalVisible, setKnockModalVisible] = useState(false);
  // knock value
  const [knockValue, setKnockValue] = useState<number | undefined>(undefined);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Load game and opponent data when the screen loads or id changes
  useEffect(() => {
    setUserName(getUserName());
    setHasPaid(getHasPaid());
    // Find the opponent and game by id
    const allOpponents = getOpponents();
    let foundOpponent: Opponent | null = null;
    let foundGame: Game | null = null;
    for (const opp of allOpponents) {
      const g = opp.games.find((game) => game.id === id);
      if (g) {
        foundOpponent = opp;
        foundGame = g;
        break;
      }
    }
    setOpponent(foundOpponent);
    setGame(foundGame);
    setKnockValue(foundGame?.knockValue);
  }, [id]);

  // Clear input fields when modal closes
  useEffect(() => {
    if (!scoreModalVisible) {
      setWinner(null);
      setScore("");
      setEditRoundIndex(null);
    }
  }, [scoreModalVisible]);

  // Handler for adding a new round or editing an existing one
  function handleSaveRound(
    totalScore: number,
    bonusType: "gin" | "bigGin" | "undercut" | null
  ) {
    if (!game || !opponent) return;
    let user = 0,
      opp = 0;
    if (winner === "user") user = totalScore;
    if (winner === "opponent") opp = totalScore;
    setLoading(true);
    let updatedScoreHistory;
    if (editRoundIndex !== null) {
      // Edit mode
      updatedScoreHistory = game.scoreHistory.map((round, idx) =>
        idx === editRoundIndex
          ? {
              ...round,
              user,
              opponent: opp,
              date: round.date || new Date().toISOString(),
              bonusType,
            }
          : round
      );
    } else {
      // Add mode: add a new round to the game's history
      updatedScoreHistory = [
        ...game.scoreHistory,
        { user, opponent: opp, date: new Date().toISOString(), bonusType },
      ];
    }
    // Winner calculation
    const gameWinner = calculateWinner(updatedScoreHistory, game.targetScore);
    const updatedGame: Game = {
      ...game,
      scoreHistory: updatedScoreHistory,
      winner: gameWinner,
    };
    // Update storage
    const allOpponents = getOpponents();
    const oppIndex = allOpponents.findIndex((o) => o.id === opponent.id);
    if (oppIndex !== -1) {
      const games = allOpponents[oppIndex].games.map((g) =>
        g.id === game.id ? updatedGame : g
      );
      allOpponents[oppIndex].games = games;
      saveOpponents(allOpponents);
    }
    setGame(updatedGame);
    setWinner(null);
    setScore("");
    setEditRoundIndex(null);
    setLoading(false);
  }

  // When opening modal for editing, prefill scores
  function openEditModal(index: number) {
    if (!game) return;
    setEditRoundIndex(index);
    const round = game.scoreHistory[index];
    let baseScore = 0;
    let bonusValue = 0;
    if (round.bonusType === "gin") bonusValue = game.ginBonus ?? 25;
    if (round.bonusType === "bigGin") bonusValue = game.bigGinBonus ?? 31;
    if (round.bonusType === "undercut") bonusValue = game.undercutBonus ?? 25;
    if (round.user > 0) {
      setWinner("user");
      baseScore = round.user - bonusValue;
      setScore(baseScore > 0 ? baseScore.toString() : "0");
    } else if (round.opponent > 0) {
      setWinner("opponent");
      baseScore = round.opponent - bonusValue;
      setScore(baseScore > 0 ? baseScore.toString() : "0");
    } else {
      setWinner(null);
      setScore("");
    }
    setScoreModalVisible(true);
  }

  // Handler for saving knock value
  function handleSaveKnockValue(value: number | undefined) {
    if (!game || !opponent) return;
    setLoading(true);
    const updatedGame: Game = { ...game, knockValue: value };
    // Update the opponent's games in storage
    const allOpponents = getOpponents();
    const oppIndex = allOpponents.findIndex((o) => o.id === opponent.id);
    if (oppIndex !== -1) {
      const games = allOpponents[oppIndex].games.map((g) =>
        g.id === game.id ? updatedGame : g
      );
      allOpponents[oppIndex].games = games;
      saveOpponents(allOpponents);
    }
    setGame(updatedGame);
    setKnockValue(value);
    setLoading(false);
    setKnockModalVisible(false);
  }

  if (!game || !opponent) return <Text>Loading...</Text>;

  // Calculate total scores using utility
  const yourTotal = getTotalScore(game.scoreHistory, "user");
  const oppTotal = getTotalScore(game.scoreHistory, "opponent");

  return (
    <>
      <Stack.Screen
        options={{
          title: `${userName} vs ${opponent.name}`,
          headerTitleStyle: {
            fontFamily: "SpaceMono",
          },
        }}
      />

      <View className="flex-1 p-4 bg-white ">
        {/* Confetti when game is complete */}
        {game.winner && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              pointerEvents: "none",
              justifyContent: "center",
              alignItems: "center",
            }}
            pointerEvents="none"
          >
            <LottieView
              source={require("../../assets/animations/confetti.json")}
              autoPlay
              loop={false}
              style={{ width: "100%", height: "100%" }}
              speed={1}
            />
          </View>
        )}
        {/* Game header with total scores */}
        <View className="flex-row justify-between p-4 mx-20">
          <View className="items-center">
            {yourTotal !== oppTotal && (
              <View style={{ height: 24 }}>
                {yourTotal > oppTotal && <Crown size={24} color="#000" />}
              </View>
            )}
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
              {yourTotal}
            </Text>
          </View>
          <View className="items-center">
            {yourTotal !== oppTotal && (
              <View style={{ height: 24 }}>
                {oppTotal > yourTotal && <Crown size={24} color="#000" />}
              </View>
            )}
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
              {oppTotal}
            </Text>
          </View>
        </View>
        {/* Show winner if game is complete */}
        {game.winner && (
          <View className="mb-6 p-4 bg-green-100  rounded-lg">
            <Text className="text-lg font-semibold text-center">
              Game Complete!{" "}
              {game.winner === "user"
                ? `${userName} won!`
                : `${opponent.name} won!`}
            </Text>
          </View>
        )}

        {/* Knock value display and edit */}
        <View className="mb-6">
          {knockValue !== undefined ? (
            <Button
              size="lg"
              onPress={() => setKnockModalVisible(true)}
              accessibilityLabel="Edit knock value"
              className=" bg-white"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText
                className="text-black"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                Knock: {knockValue}
              </ButtonText>
            </Button>
          ) : (
            <Button
              size="lg"
              onPress={() => setKnockModalVisible(true)}
              disabled={loading}
              className="bg-white"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-black">Add Knock</ButtonText>
            </Button>
          )}
        </View>
        <KnockModal
          visible={knockModalVisible}
          onClose={() => setKnockModalVisible(false)}
          onSave={handleSaveKnockValue}
          initialValue={knockValue}
          loading={loading}
        />
        {/* Modal for adding or editing score */}
        <ScoreModal
          visible={scoreModalVisible}
          onClose={() => setScoreModalVisible(false)}
          onSave={handleSaveRound}
          loading={loading}
          winner={winner}
          setWinner={setWinner}
          score={score}
          setScore={setScore}
          editRoundIndex={editRoundIndex}
          userName={userName}
          opponentName={opponent.name}
          ginBonus={game.ginBonus}
          bigGinBonus={game.bigGinBonus}
          undercutBonus={game.undercutBonus}
          editBonusType={
            editRoundIndex !== null
              ? game.scoreHistory[editRoundIndex]?.bonusType ?? null
              : null
          }
          scoreHistory={game.scoreHistory}
          hasPaid={hasPaid}
          onShowPaywall={() => setShowPaywallModal(true)}
        />
        {/* List of rounds */}
        <Text
          className="text-lg font-semibold mb-2"
          style={{ fontFamily: "SpaceMonoRegular" }}
        >
          Rounds
        </Text>
        <FlatList
          data={game.scoreHistory}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <Box className="flex-row items-center p-4 bg-gray-100  rounded-lg mb-2">
              <Text
                className="text-gray-500"
                style={{
                  fontFamily: "SpaceMonoRegular",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {index + 1}
              </Text>
              <Text
                className="text-gray-600"
                style={{
                  fontFamily: "SpaceMonoRegular",
                  flex: 2,
                  textAlign: "center",
                }}
              >
                {item.user || 0}
              </Text>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.bonusType === "gin" && (
                  <Martini size={18} color="#26ABFF" />
                )}
                {item.bonusType === "bigGin" && (
                  <Sparkle size={18} color="#26ABFF" />
                )}
                {item.bonusType === "undercut" && (
                  <Scissors size={18} color="#26ABFF" />
                )}
                {(!item.bonusType || item.bonusType === null) && (
                  <View style={{ width: 18, height: 18 }} />
                )}
              </View>
              <Text
                className="text-gray-600"
                style={{
                  fontFamily: "SpaceMonoRegular",
                  flex: 2,
                  textAlign: "center",
                }}
              >
                {item.opponent || 0}
              </Text>
              <Pressable
                onPress={() => openEditModal(index)}
                className="ml-2"
                accessibilityLabel={`Edit game ${index + 1}`}
                style={{ flex: 1, alignItems: "center" }}
              >
                <Pencil size={18} color="gray" />
              </Pressable>
            </Box>
          )}
          ListEmptyComponent={
            <Text className="p-4 text-center text-gray-500">
              No games yet. Add your first game!
            </Text>
          }
        />
        {/* <Text className="text-gray-500 mb-4 text-center">
          Target Score:{" "}
          {game.targetScore ? game.targetScore : hasPaid ? "No Limit" : 100}
        </Text> */}
        {/* Add round form if game is not complete */}
        {!game.winner && (
          <View className="mb-6">
            <Button
              size="lg"
              onPress={() => setScoreModalVisible(true)}
              disabled={loading}
              className=""
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-white">Add Score</ButtonText>
            </Button>
          </View>
        )}
      </View>
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        message="You can only play up to 100 points for free. Pay to unlock unlimited points!"
        onSuccess={() => {
          setHasPaid(true);
          setShowPaywallModal(false);
        }}
      />
    </>
  );
}
