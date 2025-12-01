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
import { Moon } from "lucide-react-native";
import type { Player } from "../utils/mmkvStorage";

interface MultiPlayerScoreModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    scores: { [playerId: string]: number },
    bonusType?: "queenOfSpades" | "shootMoon" | null,
    bonusPlayerId?: string
  ) => void;
  players: Player[];
  editRoundScores?: { [playerId: string]: number };
  editBonusType?: "queenOfSpades" | "shootMoon" | null;
  editBonusPlayerId?: string;
  editRoundIndex?: number | null;
}

export function MultiPlayerScoreModal({
  visible,
  onClose,
  onSave,
  players,
  editRoundScores,
  editBonusType,
  editBonusPlayerId,
  editRoundIndex,
}: MultiPlayerScoreModalProps) {
  const [scores, setScores] = useState<{ [playerId: string]: string }>({});
  const [shootMoonPlayerId, setShootMoonPlayerId] = useState<string | null>(
    null
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [originalScores, setOriginalScores] = useState<{ [playerId: string]: string }>({});

  // Initialize scores when modal opens
  useEffect(() => {
    if (visible) {
      const initialScores: { [playerId: string]: string } = {};
      players.forEach((p) => {
        initialScores[p.id] = editRoundScores?.[p.id]?.toString() || "";
      });
      setScores(initialScores);

      // Set shoot moon state if editing
      if (editBonusType === "shootMoon" && editBonusPlayerId) {
        setShootMoonPlayerId(editBonusPlayerId);
      } else {
        setShootMoonPlayerId(null);
      }
    }
  }, [visible, players, editRoundScores, editBonusType, editBonusPlayerId]);

  function handleUpdateScore(playerId: string, value: string) {
    setScores({ ...scores, [playerId]: value });
  }

  function handleMoonToggle(playerId: string) {
    if (shootMoonPlayerId === playerId) {
      // Unclicking - restore original scores
      setShootMoonPlayerId(null);
      setScores(originalScores);
    } else {
      // Clicking - save current scores and apply moon bonus
      setOriginalScores({ ...scores });
      setShootMoonPlayerId(playerId);

      // Update scores: shooter gets 0, others get 26
      const moonScores: { [playerId: string]: string } = {};
      players.forEach((p) => {
        if (p.id === playerId) {
          moonScores[p.id] = "0";
        } else {
          moonScores[p.id] = "26";
        }
      });
      setScores(moonScores);
    }
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

    // Convert scores to numbers (they're already updated if moon was clicked)
    const finalScores: { [playerId: string]: number } = {};
    players.forEach((p) => {
      finalScores[p.id] = parseInt(scores[p.id], 10);
    });

    // Pass shoot moon info if it was used
    if (shootMoonPlayerId) {
      onSave(finalScores, "shootMoon", shootMoonPlayerId);
    } else {
      onSave(finalScores, null);
    }
  }

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalBackdrop className="bg-black/50" />
      <ModalContent className="w-[90%] p-6">
        {/* Header */}
        <ModalHeader className="pb-4">
          <Text
            className="text-2xl font-semibold text-center"
            style={{ fontFamily: "Card" }}
          >
            {editRoundIndex !== null && editRoundIndex !== undefined
              ? `Edit Round ${editRoundIndex + 1}`
              : "New Round"}
          </Text>
        </ModalHeader>

        {/* Body */}
        <ModalBody scrollEnabled={false}>
          <Box
            className="bg-white rounded-2xl border-2 border-black p-6 mb-1 mr-1"
            style={{ boxShadow: "4px 4px 0px #000" }}
          >
            <Text className="mb-4" style={{ fontFamily: "Card", fontSize: 20 }}>
              Enter Scores
            </Text>

            {players.map((player) => (
              <Pressable
                key={player.id}
                onPress={() =>
                  setSelectedPlayerId(
                    selectedPlayerId === player.id ? null : player.id
                  )
                }
                className="flex-row items-center p-4 mb-3 border-2 border-black rounded-xl"
                style={{
                  backgroundColor:
                    selectedPlayerId === player.id ? "#dbeafe" : "#fff",
                  boxShadow:
                    selectedPlayerId === player.id ? "3px 3px 0px #000" : "none",
                }}
              >
                <Box
                  className="w-10 h-10 rounded-full border-2 border-black justify-center items-center mr-3"
                  style={{
                    backgroundColor:
                      selectedPlayerId === player.id ? player.color : "#fff",
                    boxShadow: "2px 2px 0px #000",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Card",
                      fontSize: 14,
                      color: "#000",
                    }}
                  >
                    {player.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </Box>

                <Text
                  className="flex-1"
                  style={{ fontFamily: "SpaceMonoRegular", fontSize: 16 }}
                >
                  {player.name}
                </Text>

                {selectedPlayerId === player.id ? (
                  <Box className="flex-row items-center gap-2">
                    <Input
                      className="border-2 border-black rounded-xl bg-gray-50"
                      style={{
                        boxShadow: "2px 2px 0px #000",
                        width: 80,
                      }}
                    >
                      <InputField
                        value={scores[player.id] || ""}
                        onChangeText={(v) => handleUpdateScore(player.id, v)}
                        placeholder="0"
                        keyboardType="numeric"
                        style={{
                          fontFamily: "Card",
                          fontSize: 20,
                          textAlign: "center",
                        }}
                        autoFocus
                      />
                    </Input>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleMoonToggle(player.id);
                      }}
                      className="w-10 h-10 rounded-lg border-2 border-black justify-center items-center"
                      style={{
                        backgroundColor:
                          shootMoonPlayerId === player.id ? "#fef3c7" : "#fff",
                        boxShadow: "2px 2px 0px #000",
                      }}
                    >
                      <Moon
                        size={20}
                        color="#000"
                        fill={
                          shootMoonPlayerId === player.id ? "#fbbf24" : "none"
                        }
                      />
                    </Pressable>
                  </Box>
                ) : (
                  <Box className="flex-row items-center gap-2">
                    {scores[player.id] && (
                      <Text
                        style={{
                          fontFamily: "Card",
                          fontSize: 18,
                          color: "#666",
                          minWidth: 40,
                          textAlign: "right",
                        }}
                      >
                        {scores[player.id]}
                      </Text>
                    )}
                    {shootMoonPlayerId === player.id && (
                      <Box
                        className="w-6 h-6 rounded justify-center items-center"
                        style={{ backgroundColor: "#fef3c7" }}
                      >
                        <Moon size={16} color="#000" fill="#fbbf24" />
                      </Box>
                    )}
                  </Box>
                )}
              </Pressable>
            ))}
          </Box>
        </ModalBody>

        {/* Footer */}
        <ModalFooter className="pt-4 gap-3">
          <Button
            size="lg"
            variant="outline"
            onPress={onClose}
            className="flex-1"
            style={{ boxShadow: "4px 4px 0px #000" }}
          >
            <ButtonText className="text-black" style={{ fontFamily: "Card" }}>
              Cancel
            </ButtonText>
          </Button>
          <Button
            size="lg"
            onPress={handleSave}
            className="flex-1"
            style={{ boxShadow: "4px 4px 0px #000" }}
          >
            <ButtonText className="text-white" style={{ fontFamily: "Card" }}>
              Save
            </ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
