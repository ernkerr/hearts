import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Button, ButtonText } from "../../src/components/ui/button";
import { Input, InputField } from "../../src/components/ui/input";
import {
  getOpponents,
  saveOpponents,
  getHasPaid,
  generateId,
  Game,
  getTargetScore,
  getGinValue,
  getBigGinValue,
  getUndercutValue,
} from "../../src/utils/mmkvStorage";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "../../src/components/ui/modal";
import BuyButton from "@/src/components/BuyButton";
import PaywallModal from "../../src/components/PaywallModal";

// This screen lets the user start a new game for an opponent
export default function NewGameScreen() {
  const router = useRouter();
  const { opponentId } = useLocalSearchParams(); // Get opponent ID from route
  // State for the target score input
  const [targetScore, setTargetScore] = useState("");
  // State for 'No Limit' toggle (paid users only)
  const [noLimit, setNoLimit] = useState(false);
  // State for paywall
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // State for loading
  const [loading, setLoading] = useState(false);
  // State for bonus values
  const [gin, setGin] = useState(25);
  const [bigGin, setBigGin] = useState(31);
  const [undercut, setUndercut] = useState(25);
  const [showModal, setShowModal] = useState(true);

  // Check if the user has paid and prefill values when the screen loads
  useEffect(() => {
    setHasPaid(getHasPaid());
    setGin(getGinValue());
    setBigGin(getBigGinValue());
    setUndercut(getUndercutValue());
    const defaultTarget = getTargetScore();
    setTargetScore(defaultTarget.toString());
  }, []);

  // Handler for creating a new game
  function handleCreateGame() {
    if (!opponentId) return;
    const opponents = getOpponents();
    const opponentIndex = opponents.findIndex((o) => o.id === opponentId);
    if (opponentIndex === -1) {
      Alert.alert("Error", "Opponent not found.");
      return;
    }
    if (!hasPaid && opponents[opponentIndex].games.length >= 1) {
      setShowPaywallModal(true);
      return;
    }

    // Free users: target score is always 100
    let score = 100;
    if (hasPaid) {
      if (noLimit) {
        score = 0; // 0 means 'No Limit'
      } else {
        score = parseInt(targetScore) || 100;
        if (score < 1) score = 100;
      }
    }
    setLoading(true);
    // Create the new game object
    const newGame: Game = {
      id: generateId(),
      date: new Date().toISOString(),
      scoreHistory: [],
      winner: null,
      targetScore: score,
      ginBonus: gin,
      bigGinBonus: bigGin,
      undercutBonus: undercut,
    };
    // Add the new game to the opponent
    opponents[opponentIndex].games.push(newGame);
    saveOpponents(opponents);
    setLoading(false);
    // Navigate to the new game detail screen
    router.replace(`/game/${newGame.id}`);
  }

  return (
    <>
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        message="You can only have one game for free. Pay to unlock unlimited games!"
        onSuccess={async () => {
          setHasPaid(true);
          setShowPaywallModal(false);
          await handleCreateGame();
        }}
      />
      {/* Modal for default game rules */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalBackdrop className="bg-black/50" />
        <ModalContent className="bg-white  rounded-lg p-6">
          <ModalHeader>
            <Text
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Use default game rules?
            </Text>
          </ModalHeader>
          <ModalBody className="p-2">
            <Text
              className="bg-yellow-300 text-black font-bold border-4 border-black rounded-lg px-4 py-2 mb-2 text-center shadow-[4px_4px_0px_#000]"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Target Score: {targetScore}
            </Text>
            <Text
              className="bg-yellow-300 text-black font-bold border-4 border-black rounded-lg px-4 py-2 mb-2 text-center shadow-[4px_4px_0px_#000]"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Gin Bonus: {gin}
            </Text>
            <Text
              className="bg-yellow-300 text-black font-bold border-4 border-black rounded-lg px-4 py-2 mb-2 text-center shadow-[4px_4px_0px_#000]"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Big Gin Bonus: {bigGin}
            </Text>
            <Text
              className="bg-yellow-300 text-black font-bold border-4 border-black rounded-lg px-4 py-2 mb-2 text-center shadow-[4px_4px_0px_#000]"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Undercut Bonus: {undercut}
            </Text>
          </ModalBody>
          <ModalFooter className="flex-row  gap-4 mx-4">
            <Button
              action="secondary"
              onPress={() => setShowModal(false)}
              className="mr-2 flex-1"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-black">No</ButtonText>
            </Button>
            <Button
              action="primary"
              onPress={async () => {
                setShowModal(false);
                await handleCreateGame();
              }}
              className=" flex-1"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-white">Yes</ButtonText>
            </Button>
          </ModalFooter>
          <ModalCloseButton onPress={() => setShowModal(false)} />
        </ModalContent>
      </Modal>
      {/* End Modal */}
      <Stack.Screen
        options={{
          title: "Set Game Rules",
          headerTitleStyle: {
            fontFamily: "SpaceMono",
          },
        }}
      />
      <View className="flex-1 p-4 bg-white ">
        {/* <Text className="text-2xl font-bold mb-6">Start New Game</Text> */}
        {/* Target score input (paid users can set, free users see 100) */}
        {hasPaid ? (
          <>
            <Text
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Target Score
            </Text>
            <Input
              variant="outline"
              size="lg"
              isDisabled={noLimit || loading}
              isInvalid={false}
              isReadOnly={false}
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <InputField
                placeholder="Target Score (e.g. 100, 150)"
                value={targetScore}
                onChangeText={setTargetScore}
                keyboardType="numeric"
                style={{ fontFamily: "SpaceMonoRegular" }}
              />
            </Input>
            {/* No Limit toggle */}
            <Button
              size="sm"
              // TODO: make this a toggle button
              action={noLimit ? "primary" : "secondary"}
              onPress={() => setNoLimit((v) => !v)}
              className="mt-4 rounded-full w-[40%] self-center"
              // style={{
              //   boxShadow: "4px 4px 0px #000",
              // }}
            >
              <ButtonText className="text-black">
                {noLimit ? "No Limit Enabled" : "Enable No Limit"}
              </ButtonText>
            </Button>
          </>
        ) : (
          <Text
            className="mb-4 text-gray-500"
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            Target Score: 100 (free version limit)
          </Text>
        )}
        {/* Gin Bonus input */}
        <Text
          className="text-lg font-semibold mt-4 mb-2"
          style={{ fontFamily: "SpaceMonoRegular" }}
        >
          Gin Bonus
        </Text>
        <Input
          variant="outline"
          size="md"
          isDisabled={loading}
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
          />
        </Input>
        {/* Big Gin Bonus input */}
        <Text
          className="text-lg font-semibold mt-4 mb-2"
          style={{ fontFamily: "SpaceMonoRegular" }}
        >
          Big Gin Bonus
        </Text>
        <Input
          variant="outline"
          size="md"
          isDisabled={loading}
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
          />
        </Input>
        {/* Undercut Bonus input */}
        <Text
          className="text-lg font-semibold mt-4 mb-2"
          style={{ fontFamily: "SpaceMonoRegular" }}
        >
          Undercut Bonus
        </Text>
        <Input
          variant="outline"
          size="md"
          isDisabled={loading}
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
          />
        </Input>

        {/* Create game button */}
        <View className="flex-row justify-center mt-6 gap-4">
          {/* Cancel button */}
          <Button
            size="lg"
            action="secondary"
            onPress={() => router.back()}
            className=""
            disabled={loading}
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <ButtonText className="text-black">Cancel</ButtonText>
          </Button>
          <Button
            size="lg"
            onPress={handleCreateGame}
            disabled={loading}
            className=""
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <ButtonText className="text-white">Start Game</ButtonText>
          </Button>
        </View>
      </View>
    </>
  );
}
