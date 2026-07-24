import React from "react";
import { Text, Alert, Linking } from "react-native";
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
import * as StoreReview from "expo-store-review";
import { APP_URLS } from "../config/app.config";
import { setRateRated } from "../utils/mmkvStorage";

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Soft-ask review prompt, shown at a positive moment (a finished game).
 * On "Rate" we fire the native StoreReview prompt (which Apple rate-limits to a
 * few times per year); if it's unavailable we fall back to the App Store
 * write-a-review deep link. We can't tell whether a review was actually left,
 * so "Rate" just backs the re-ask cadence off (every 10th game instead of
 * every 3rd); "Not Now" keeps the normal cadence. The soft-ask filters happy
 * users so we don't burn the native prompt on someone who's frustrated.
 */
export default function RateModal({ isOpen, onClose }: RateModalProps) {
  async function handleRate() {
    // They said yes — back off to the slower re-ask cadence.
    setRateRated(true);
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      } else {
        await Linking.openURL(APP_URLS.writeReview);
      }
    } catch {
      Linking.openURL(APP_URLS.writeReview).catch(() =>
        Alert.alert("Couldn't open the App Store", "Please try again later.")
      );
    } finally {
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop className="bg-black/50" />
      <ModalContent className="bg-white rounded-lg p-6">
        <ModalHeader className="justify-center mt-2">
          <Text
            className="text-xl font-bold"
            style={{ fontFamily: "SpaceMono" }}
          >
            Enjoying Hearts Score Tracker?
          </Text>
        </ModalHeader>
        <ModalBody className="my-6">
          <Text
            className="text-center"
            style={{ fontFamily: "SpaceMonoRegular" }}
          >
            If you're having fun, a quick rating on the App Store really helps.
            It only takes a few seconds!
          </Text>
        </ModalBody>
        <ModalFooter className="flex-col justify-between">
          <Button
            size="xl"
            action="primary"
            onPress={handleRate}
            className="w-full h-14"
            style={{ boxShadow: "4px 4px 0px #000" }}
          >
            <ButtonText
              className="text-white"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontFamily: "Card", fontSize: 14 }}
            >
              Rate on the App Store
            </ButtonText>
          </Button>
          <Button
            size="xl"
            action="secondary"
            onPress={onClose}
            className="w-full my-4 h-14"
            style={{ boxShadow: "4px 4px 0px #000" }}
          >
            <ButtonText
              className="text-black"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontFamily: "Card", fontSize: 14 }}
            >
              Not Now
            </ButtonText>
          </Button>
        </ModalFooter>
        <ModalCloseButton onPress={onClose} />
      </ModalContent>
    </Modal>
  );
}
