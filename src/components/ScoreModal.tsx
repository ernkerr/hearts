import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import {
  getGinValue,
  getBigGinValue,
  getUndercutValue,
} from "../utils/mmkvStorage";
import { canAddScore } from "../utils/gameLogic";

//ui
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "./ui/modal";
import { Button, ButtonText } from "./ui/button";
import { Input, InputField } from "./ui/input";
import { Box } from "./ui/box";
import { Martini, GlassWater, Scissors } from "lucide-react-native";

export function ScoreModal({
  visible,
  onClose,
  onSave,
  loading,
  winner,
  setWinner,
  score,
  setScore,
  editRoundIndex,
  userName,
  opponentName,
  ginBonus,
  bigGinBonus,
  undercutBonus,
  editBonusType,
  scoreHistory,
  hasPaid,
  onShowPaywall,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (
    totalScore: number,
    selectedBonus: "gin" | "bigGin" | "undercut" | null
  ) => void;
  loading: boolean;
  winner: "user" | "opponent" | null;
  setWinner: (v: "user" | "opponent") => void;
  score: string;
  setScore: (v: string) => void;
  editRoundIndex: number | null;
  userName: string;
  opponentName: string;
  ginBonus?: number;
  bigGinBonus?: number;
  undercutBonus?: number;
  editBonusType?: "gin" | "bigGin" | "undercut" | null;
  scoreHistory: { user: number; opponent: number }[];
  hasPaid: boolean;
  onShowPaywall: () => void;
}) {
  const [bonusValue, setBonusValue] = useState<number | null>(null);
  const [gin, setGin] = useState(ginBonus ?? 25);
  const [bigGin, setBigGin] = useState(bigGinBonus ?? 31);
  const [undercut, setUndercut] = useState(undercutBonus ?? 25);
  const [selectedBonus, setSelectedBonus] = useState<
    "gin" | "bigGin" | "undercut" | null
  >(null);

  // // State for winner warning
  const [showWinnerWarning, setShowWinnerWarning] = useState(false);

  // Fetch bonus values when modal opens, only if not provided as props
  useEffect(() => {
    if (
      visible &&
      (ginBonus === undefined ||
        bigGinBonus === undefined ||
        undercutBonus === undefined)
    ) {
      if (ginBonus === undefined) setGin(getGinValue());
      if (bigGinBonus === undefined) setBigGin(getBigGinValue());
      if (undercutBonus === undefined) setUndercut(getUndercutValue());
    } else if (visible) {
      if (ginBonus !== undefined) setGin(ginBonus);
      if (bigGinBonus !== undefined) setBigGin(bigGinBonus);
      if (undercutBonus !== undefined) setUndercut(undercutBonus);
    }
  }, [visible, ginBonus, bigGinBonus, undercutBonus]);

  // Set or clear bonus selection when the modal opens
  useEffect(() => {
    if (visible) {
      if (editRoundIndex !== null && editBonusType) {
        setSelectedBonus(editBonusType);
        let value = 0;
        if (editBonusType === "gin") value = gin;
        if (editBonusType === "bigGin") value = bigGin;
        if (editBonusType === "undercut") value = undercut;
        setBonusValue(value);
      } else {
        setSelectedBonus(null);
        setBonusValue(null);
      }
    }
  }, [visible, editRoundIndex, editBonusType, gin, bigGin, undercut]);

  // Handler for bonus button press
  function handleBonusPress(type: "gin" | "bigGin" | "undercut") {
    // If clicking the same bonus type that's already selected, unselect it
    if (selectedBonus === type) {
      setSelectedBonus(null);
      setBonusValue(null);
      return;
    }

    let value = 0;
    if (type === "gin") value = gin;
    if (type === "bigGin") value = bigGin;
    if (type === "undercut") value = undercut;
    setSelectedBonus(type);
    setBonusValue(value);
  }

  // Debug: log when setScore and setWinner are called
  const handleScoreChange = (val: string) => {
    // console.log("[ScoreModal] setScore called with:", val);
    setScore(val);
  };
  const handleWinnerChange = (val: "user" | "opponent") => {
    // console.log("[ScoreModal] setWinner called with:", val);
    setWinner(val);
  };

  // Compute base score and total score
  const sanitized = score.replace(/[^0-9]/g, "");
  const baseScore = sanitized ? parseInt(sanitized, 10) : 0;
  const totalScore = baseScore + (bonusValue || 0);

  // Handler for Save button
  function handleSave() {
    if (!winner) {
      setShowWinnerWarning(true);
      return;
    }
    // Determine user/opp for this round
    let user = 0,
      opp = 0;
    if (winner === "user") user = totalScore;
    if (winner === "opponent") opp = totalScore;
    // Check paywall for both add and edit
    if (!canAddScore(scoreHistory, user, opp, hasPaid)) {
      onShowPaywall();
      return;
    }
    onSave(totalScore, selectedBonus);
    onClose();
  }

  // Hide warning when winner is selected
  // useEffect(() => {
  //   if (winner) setShowWinnerWarning(false);
  // }, [winner]);

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalBackdrop className="bg-black/50" />

      <ModalContent className="p-4 w-[95%] max-h-[80%] mb-[30%] pb-6">
        {showWinnerWarning && (
          <Modal
            isOpen={showWinnerWarning}
            onClose={() => setShowWinnerWarning(false)}
          >
            <ModalBackdrop className="bg-black/50" />
            <ModalContent>
              <Text
                className="text-lg mb-4 p-4"
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                Please select a winner before saving.
              </Text>
              <Button onPress={() => setShowWinnerWarning(false)}>
                <ButtonText style={{ fontFamily: "SpaceMono" }}>
                  Okay
                </ButtonText>
              </Button>
            </ModalContent>
          </Modal>
        )}
        <ModalHeader>
          <View className="flex-1 items-center justify-center">
            <Text
              className="text-xl font-semibold"
              style={{ fontFamily: "SpaceMono" }}
            >
              {editRoundIndex !== null
                ? `Edit Round ${editRoundIndex + 1}`
                : "New Score"}
            </Text>
          </View>
        </ModalHeader>
        <ModalBody className="ml-2">
          {/* Winner  */}
          <Text
            className="text-lg font-semibold"
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            Winner
          </Text>
          {/* {showWinnerWarning && (
            <Text
              className="text-red-500 mb-2"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Please select a winner before saving.
            </Text>
          )} */}
          <Box className="flex-row justify-between my-2 gap-2 mr-2">
            <Button
              className={`flex-1 rounded-md items-center ${
                winner === "user" ? "bg-[#26ABFF]" : "bg-white border-2"
              }`}
              onPress={() => handleWinnerChange("user")}
              style={{
                boxShadow: winner === "user" ? "4px 4px 0px #000" : "none",
              }}
            >
              <Text
                className={winner === "user" ? "text-white" : ""}
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                {userName}
              </Text>
            </Button>
            <Button
              className={`flex-1 rounded-md items-center ${
                winner === "opponent" ? "bg-[#26ABFF]" : "bg-white border-2"
              }`}
              onPress={() => handleWinnerChange("opponent")}
              style={{
                boxShadow: winner === "opponent" ? "4px 4px 0px #000" : "none",
              }}
            >
              <Text
                className={winner === "opponent" ? "text-white" : ""}
                style={{ fontFamily: "SpaceMonoRegular" }}
              >
                {opponentName}
              </Text>
            </Button>
          </Box>
          {/* Score  */}
          <Text
            className="text-lg font-semibold"
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            Score
          </Text>
          <View className="flex-row space-x-4 mb-4 mr-2">
            <Input
              variant="outline"
              size="lg"
              isDisabled={loading}
              className="flex-1"
            >
              <InputField
                placeholder="Score"
                value={score}
                onChangeText={handleScoreChange}
                keyboardType="numeric"
                style={{ fontFamily: "SpaceMonoRegular" }}
              />
            </Input>
          </View>
          {/* Bonus  */}
          <Text
            className="text-lg font-semibold"
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            Bonus
          </Text>
          <Box
            className={`flex-row flex-wrap gap-2 mr-2  ${
              selectedBonus ? "mb-2" : "mb-4"
            }`}
          >
            <Button
              variant="outline"
              className={`border-2 flex-1 min-w-[100px] ${
                selectedBonus === "gin" ? "border-[#26ABFF] border-2" : ""
              }`}
              onPress={() => handleBonusPress("gin")}
              style={{
                boxShadow:
                  selectedBonus === "gin" ? "4px 4px 0px #000" : "none",
              }}
            >
              <Martini
                size={20}
                color={selectedBonus === "gin" ? "#26ABFF" : "#000"}
              />
              <ButtonText
                style={{ fontFamily: "SpaceMonoRegular" }}
                className="text-black"
              >
                Gin
              </ButtonText>
            </Button>
            <Button
              variant="outline"
              className={`border-2 flex-1 min-w-[100px] ${
                selectedBonus === "bigGin" ? "border-[#26ABFF] border-2" : ""
              }`}
              onPress={() => handleBonusPress("bigGin")}
              style={{
                boxShadow:
                  selectedBonus === "bigGin" ? "4px 4px 0px #000" : "none",
              }}
            >
              <GlassWater
                size={20}
                color={selectedBonus === "bigGin" ? "#26ABFF" : "#000"}
              />
              <ButtonText
                style={{ fontFamily: "SpaceMonoRegular" }}
                className="text-black"
              >
                Big Gin
              </ButtonText>
            </Button>
            <Button
              variant="outline"
              className={`border-2 flex-1 min-w-[100px] ${
                selectedBonus === "undercut" ? "border-[#26ABFF] border-2" : ""
              }`}
              onPress={() => handleBonusPress("undercut")}
              style={{
                boxShadow:
                  selectedBonus === "undercut" ? "4px 4px 0px #000" : "none",
              }}
            >
              <View className="flex-row items-center justify-center gap-1">
                <Scissors
                  size={20}
                  color={selectedBonus === "undercut" ? "#26ABFF" : "#000"}
                />
                <ButtonText
                  style={{ fontFamily: "SpaceMonoRegular" }}
                  className="text-black"
                >
                  Undercut
                </ButtonText>
              </View>
            </Button>
          </Box>

          {/* Show bonus value if selected */}
          {selectedBonus && (
            <Text
              className="mt-2 mb-2 text-base text-[#26ABFF]"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Bonus: +{bonusValue}
            </Text>
          )}

          {/* Total Score  */}
          <Text
            className="text-lg font-semibold"
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            Total Score
          </Text>
          <Input variant="outline" size="lg" className="flex-1 mr-2">
            <InputField
              placeholder="Total Score"
              value={totalScore.toString()}
              editable={false}
              keyboardType="numeric"
              style={{ fontFamily: "SpaceMonoRegular" }}
            />
          </Input>
        </ModalBody>
        <ModalFooter className="justify-center mx-4">
          <Button
            size="lg"
            variant="outline"
            onPress={onClose}
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
            className="flex-1"
            style={{
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <ButtonText className="text-white">Save</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
