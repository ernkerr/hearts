import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalBackdrop,
} from "./ui/modal";
import { Button, ButtonText } from "./ui/button";
import { Input, InputField } from "./ui/input";

export function KnockModal({
  visible,
  onClose,
  onSave,
  initialValue,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (value: number | undefined) => void;
  initialValue?: number;
  loading?: boolean;
}) {
  const [value, setValue] = useState(
    initialValue !== undefined ? initialValue.toString() : ""
  );

  useEffect(() => {
    setValue(initialValue !== undefined ? initialValue.toString() : "");
  }, [initialValue, visible]);

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalBackdrop className="bg-black/50" />
      <ModalContent>
        <ModalHeader>
          <View className="flex-1 items-center justify-center">
            <Text
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: "SpaceMonoRegular" }}
            >
              Set Knock Value
            </Text>
          </View>
        </ModalHeader>
        <ModalBody>
          <View className="flex-row items-center mb-2 gap-2">
            <Input
              variant="outline"
              size="lg"
              isDisabled={loading}
              className="flex-1"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <InputField
                placeholder="Enter knock value"
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
                style={{ fontFamily: "SpaceMonoRegular" }}
              ></InputField>
            </Input>
            <Button
              variant="outline"
              onPress={() => setValue("")}
              className="ml-2 mr-2 border-2 h-11"
              disabled={loading || value === ""}
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-black">X</ButtonText>
            </Button>
          </View>
        </ModalBody>
        <ModalFooter>
          <View className="flex-row items-center  gap-2 ">
            <Button
              size="lg"
              variant="outline"
              onPress={onClose}
              className="border-2 flex-1"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-black">Cancel</ButtonText>
            </Button>
            <Button
              size="lg"
              onPress={() => {
                const num = parseInt(value);
                if (value === "") onSave(undefined);
                else if (!isNaN(num)) onSave(num);
              }}
              disabled={loading}
              className="flex-1"
              style={{
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ButtonText className="text-white">Save</ButtonText>
            </Button>
          </View>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
