import React, { useState } from "react";
import { Alert } from "react-native";
import { setHasPaid } from "../utils/mmkvStorage";
import { ensureIapConnection, isEntitledFromStore } from "../utils/iap";
import { Button, ButtonText } from "./ui/button";
import { Spinner } from "./ui/Spinner";

export default function RestoreButton() {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    try {
      await ensureIapConnection();
      // Re-check the store for an active subscription OR a honored legacy
      // one-time purchase. Same derivation as the launch/focus refresh.
      const entitled = await isEntitledFromStore();

      if (entitled) {
        // Update local storage to reflect premium status
        await setHasPaid(true);
        Alert.alert("Restored", "Your premium access has been restored.");
      } else {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find an active subscription or previous purchase on this account."
        );
      }
    } catch (err) {
      console.warn("Restore failed", err);
      Alert.alert(
        "Error",
        "Failed to restore purchases. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onPress={handleRestore}
      size="lg"
      action="secondary"
      className="flex-1 mt-2"
      style={{ boxShadow: "4px 4px 0px #000" }}
      disabled={loading}
    >
      {loading ? (
        <Spinner />
      ) : (
        <ButtonText className="text-black">Restore Purchase</ButtonText>
      )}
    </Button>
  );
}
