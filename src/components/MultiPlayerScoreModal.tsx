import React, { useState, useEffect } from "react";
import { ScrollView, Pressable } from "react-native";
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
import { Text } from "./ui/text";
import { Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel } from "./ui/checkbox";
import { CheckIcon, Select, SelectTrigger, SelectInput, SelectPortal, SelectBackdrop, SelectContent, SelectItem } from "./ui/select";
import type { Player } from "../utils/mmkvStorage";
import { applyShootMoonBonus } from "../utils/gameLogic";

interface MultiPlayerScoreModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (scores: { [playerId: string]: number }, bonusType?: "queenOfSpades" | "shootMoon" | null, bonusPlayerId?: string) => void;
  players: Player[];
  editRoundScores?: { [playerId: string]: number };
  editBonusType?: "queenOfSpades" | "shootMoon" | null;
  editBonusPlayerId?: string;
}

export function MultiPlayerScoreModal({
  visible,
  onClose,
  onSave,
  players,
  editRoundScores,
  editBonusType,
  editBonusPlayerId,
}: MultiPlayerScoreModalProps) {
  const [scores, setScores] = useState<{ [playerId: string]: string }>({});
  const [queenOfSpadesChecked, setQueenOfSpadesChecked] = useState(false);
  const [queenOfSpadesPlayerId, setQueenOfSpadesPlayerId] = useState<string>("");
  const [shootMoonChecked, setShootMoonChecked] = useState(false);
  const [shootMoonPlayerId, setShootMoonPlayerId] = useState<string>("");

  // Initialize scores when modal opens
  useEffect(() => {
    if (visible) {
      const initialScores: { [playerId: string]: string } = {};
      players.forEach((p) => {
        initialScores[p.id] = editRoundScores?.[p.id]?.toString() || "";
      });
      setScores(initialScores);

      // Set bonus states if editing
      if (editBonusType === "queenOfSpades" && editBonusPlayerId) {
        setQueenOfSpadesChecked(true);
        setQueenOfSpadesPlayerId(editBonusPlayerId);
      } else {
        setQueenOfSpadesChecked(false);
        setQueenOfSpadesPlayerId("");
      }

      if (editBonusType === "shootMoon" && editBonusPlayerId) {
        setShootMoonChecked(true);
        setShootMoonPlayerId(editBonusPlayerId);
      } else {
        setShootMoonChecked(false);
        setShootMoonPlayerId("");
      }
    }
  }, [visible, players, editRoundScores, editBonusType, editBonusPlayerId]);

  function handleUpdateScore(playerId: string, value: string) {
    setScores({ ...scores, [playerId]: value });
  }

  function handleSave() {
    // Validate all scores are entered
    const allScoresValid = players.every((p) => {
      const score = scores[p.id];
      return score !== "" && !isNaN(parseInt(score, 10));
    });

    if (!allScoresValid) {
      alert("Please enter valid scores for all players");
      return;
    }

    // Convert scores to numbers
    let finalScores: { [playerId: string]: number } = {};
    players.forEach((p) => {
      finalScores[p.id] = parseInt(scores[p.id], 10);
    });

    // Apply Shoot the Moon if checked
    if (shootMoonChecked) {
      if (!shootMoonPlayerId) {
        alert("Please select who shot the moon");
        return;
      }
      finalScores = applyShootMoonBonus(finalScores, shootMoonPlayerId);
      onSave(finalScores, "shootMoon", shootMoonPlayerId);
      return;
    }

    // Apply Queen of Spades if checked
    if (queenOfSpadesChecked) {
      if (!queenOfSpadesPlayerId) {
        alert("Please select who got the Queen of Spades");
        return;
      }
      finalScores[queenOfSpadesPlayerId] += 13;
      onSave(finalScores, "queenOfSpades", queenOfSpadesPlayerId);
      return;
    }

    // No bonus
    onSave(finalScores, null);
  }

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-h-[90%]" style={{ maxWidth: 500 }}>
        <ModalHeader className="border-b-2 border-black">
          <Text style={{ fontFamily: "Card", fontSize: 20 }}>Round Scores</Text>
        </ModalHeader>

        <ModalBody>
          <ScrollView>
            <Box className="mb-4">
              <Text style={{ fontFamily: "Card", fontSize: 16, marginBottom: 12 }}>
                Player Scores
              </Text>

              {players.map((player) => (
                <Box key={player.id} className="mb-4">
                  <Box className="flex-row items-center mb-2">
                    <Box
                      className="w-6 h-6 rounded-full border-2 border-black mr-2"
                      style={{ backgroundColor: player.color }}
                    />
                    <Text style={{ fontFamily: "SpaceMonoRegular", fontSize: 14 }}>
                      {player.name}
                    </Text>
                  </Box>
                  <Input className="border-2 border-black rounded-lg">
                    <InputField
                      value={scores[player.id] || ""}
                      onChangeText={(v) => handleUpdateScore(player.id, v)}
                      placeholder="0"
                      keyboardType="numeric"
                      style={{ fontFamily: "SpaceMonoRegular" }}
                    />
                  </Input>
                </Box>
              ))}
            </Box>

            <Box className="border-t-2 border-gray-200 pt-4">
              <Text style={{ fontFamily: "Card", fontSize: 16, marginBottom: 12 }}>
                Bonuses
              </Text>

              {/* Queen of Spades */}
              <Box className="mb-4">
                <Checkbox
                  value={queenOfSpadesChecked ? "checked" : "unchecked"}
                  isChecked={queenOfSpadesChecked}
                  onChange={() => setQueenOfSpadesChecked(!queenOfSpadesChecked)}
                  className="mb-2"
                >
                  <CheckboxIndicator className="border-2 border-black">
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel style={{ fontFamily: "SpaceMonoRegular", marginLeft: 8 }}>
                    Queen of Spades (+13)
                  </CheckboxLabel>
                </Checkbox>

                {queenOfSpadesChecked && (
                  <Box className="ml-8">
                    <Text style={{ fontFamily: "SpaceMonoRegular", fontSize: 12, marginBottom: 4 }}>
                      Who got it?
                    </Text>
                    {players.map((player) => (
                      <Pressable
                        key={player.id}
                        onPress={() => setQueenOfSpadesPlayerId(player.id)}
                        className="flex-row items-center py-2"
                      >
                        <Box
                          className="w-4 h-4 rounded-full border-2 border-black mr-2"
                          style={{
                            backgroundColor: queenOfSpadesPlayerId === player.id ? "#000" : "#fff",
                          }}
                        />
                        <Text style={{ fontFamily: "SpaceMonoRegular", fontSize: 14 }}>
                          {player.name}
                        </Text>
                      </Pressable>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Shoot the Moon */}
              <Box className="mb-4">
                <Checkbox
                  value={shootMoonChecked ? "checked" : "unchecked"}
                  isChecked={shootMoonChecked}
                  onChange={() => setShootMoonChecked(!shootMoonChecked)}
                  className="mb-2"
                >
                  <CheckboxIndicator className="border-2 border-black">
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel style={{ fontFamily: "SpaceMonoRegular", marginLeft: 8 }}>
                    Shot the Moon (26 to all others)
                  </CheckboxLabel>
                </Checkbox>

                {shootMoonChecked && (
                  <Box className="ml-8">
                    <Text style={{ fontFamily: "SpaceMonoRegular", fontSize: 12, marginBottom: 4 }}>
                      Who shot it?
                    </Text>
                    {players.map((player) => (
                      <Pressable
                        key={player.id}
                        onPress={() => setShootMoonPlayerId(player.id)}
                        className="flex-row items-center py-2"
                      >
                        <Box
                          className="w-4 h-4 rounded-full border-2 border-black mr-2"
                          style={{
                            backgroundColor: shootMoonPlayerId === player.id ? "#000" : "#fff",
                          }}
                        />
                        <Text style={{ fontFamily: "SpaceMonoRegular", fontSize: 14 }}>
                          {player.name}
                        </Text>
                      </Pressable>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </ScrollView>
        </ModalBody>

        <ModalFooter className="border-t-2 border-black">
          <Box className="flex-row gap-4 w-full">
            <Button
              onPress={onClose}
              className="flex-1 bg-gray-300 border-2 border-black rounded-xl"
              style={{ boxShadow: "2px 2px 0px #000" }}
            >
              <ButtonText style={{ fontFamily: "Card", color: "#000" }}>
                Cancel
              </ButtonText>
            </Button>
            <Button
              onPress={handleSave}
              className="flex-1 bg-black border-2 border-black rounded-xl"
              style={{ boxShadow: "2px 2px 0px #000" }}
            >
              <ButtonText style={{ fontFamily: "Card" }}>Save Round</ButtonText>
            </Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
