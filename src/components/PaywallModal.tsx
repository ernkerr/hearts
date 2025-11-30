import React, { useState } from "react";
import { View, Text, Alert, Platform } from "react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "./ui/modal";
import { Button, ButtonText } from "./ui/button";
import { Input, InputField } from "./ui/input";
import BuyButton from "./BuyButton";
import { setHasPaid } from "../utils/mmkvStorage";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onSuccess?: () => void;
  codeValidator?: (code: string) => boolean | Promise<boolean>; // Optional custom code validation
}

export default function PaywallModal({
  isOpen,
  onClose,
  message,
  onSuccess,
  codeValidator,
}: PaywallModalProps) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  // Default code validator (for demo, accepts 'GRATITUDE')
  const defaultValidator = async (input: string) =>
    input.trim().toUpperCase() === "GRATITUDE";

  function handleCodeSubmit() {
    setCodeLoading(true);
    setCodeError("");
    Promise.resolve(
      codeValidator ? codeValidator(code) : defaultValidator(code)
    )
      .then((isValid) => {
        if (isValid) {
          setHasPaid(true);
          if (onSuccess) onSuccess();
          onClose();
          Alert.alert("Success", "Code accepted! You now have full access.");
        } else {
          setCodeError("Invalid code. Please try again.");
        }
      })
      .catch(() => {
        setCodeError("Something went wrong. Please try again.");
      })
      .finally(() => {
        setCodeLoading(false);
      });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop className="bg-black/50" />
      <ModalContent className="bg-white rounded-lg p-6 w-[80%]">
        <ModalHeader className="justify-center mt-2">
          <Text
            className="text-xl font-bold"
            style={{ fontFamily: "SpaceMono" }}
          >
            Upgrade Required
          </Text>
        </ModalHeader>
        <ModalBody className="">
          <Text className="" style={{ fontFamily: "SpaceMonoRegular" }}>
            {message}
          </Text>
        </ModalBody>
        <ModalFooter className="flex-col justify-between">
          <BuyButton
            onSuccess={async () => {
              if (onSuccess) onSuccess();
              onClose();
            }}
          />
          {/* Only show code input on Android */}
          {Platform.OS === "android" && showCodeInput ? (
            <View className="mt-4">
              <Input variant="outline" size="md" isDisabled={codeLoading}>
                <InputField
                  placeholder="Enter code"
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                  style={{ fontFamily: "SpaceMonoRegular" }}
                />
              </Input>
              {codeError ? (
                <Text
                  className="text-red-500 mt-2"
                  style={{ fontFamily: "SpaceMonoRegular" }}
                >
                  {codeError}
                </Text>
              ) : null}
              <Button
                // size="md"
                // action="primary"
                onPress={handleCodeSubmit}
                className="my-4 "
                style={{ boxShadow: "4px 4px 0px #000" }}
              >
                <ButtonText className="text-white text-center">
                  Redeem Code
                </ButtonText>
              </Button>
            </View>
          ) : null}
          <Button
            action="secondary"
            onPress={onClose}
            className="w-full my-4"
            style={{ boxShadow: "4px 4px 0px #000" }}
          >
            <ButtonText className="text-black">Cancel</ButtonText>
          </Button>
          {/* Small pressable for code input, only on Android */}
          {Platform.OS === "android" && !showCodeInput && (
            <Text
              className="text-[#26ABFF] text-center mt-2 underline"
              style={{ fontFamily: "SpaceMonoRegular" }}
              onPress={() => setShowCodeInput(true)}
            >
              Have a code?
            </Text>
          )}
        </ModalFooter>
        <ModalCloseButton onPress={onClose} />
      </ModalContent>
    </Modal>
  );
}
