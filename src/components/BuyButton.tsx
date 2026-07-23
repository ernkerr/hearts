import React, { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  getSubscriptions,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type Subscription,
  type SubscriptionAndroid,
  type Purchase,
} from "react-native-iap";
import { setHasPaid } from "../utils/mmkvStorage";
import { ensureIapConnection, SUBSCRIPTION_SKU } from "../utils/iap";
import { Button, ButtonText } from "./ui/button";
import { Spinner } from "./ui/Spinner";

const sku = SUBSCRIPTION_SKU; // "hearts_premium_yearly"

export default function BuyButton({ onSuccess }: { onSuccess?: () => void }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let purchaseUpdateSub: any;
    let purchaseErrorSub: any;

    const init = async () => {
      try {
        await ensureIapConnection();
        const subs = await getSubscriptions({ skus: [sku] });
        setSubscription(subs[0] ?? null);
      } catch (err) {
        console.warn("Error loading IAP subscriptions", err);
      }

      // Listen to purchase updates
      purchaseUpdateSub = purchaseUpdatedListener(
        async (purchase: Purchase) => {
          try {
            const receipt = purchase.transactionReceipt;
            if (receipt) {
              // Acknowledge / Finish transaction (very important!)
              await finishTransaction({ purchase });
              await setHasPaid(true);
              setLoading(false);
              onSuccess?.();
            }
          } catch (ackErr) {
            setLoading(false);
            console.warn("Failed to finish transaction", ackErr);
          }
        }
      );

      // Listen to purchase errors
      purchaseErrorSub = purchaseErrorListener((error) => {
        setLoading(false);
        if (error.code !== "E_USER_CANCELLED") {
          console.warn("Purchase error", error);
          Alert.alert("Purchase failed", error.message);
        }
      });
    };

    init();

    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
    };
  }, [onSuccess]);

  const handleBuy = async () => {
    setLoading(true);
    try {
      if (Platform.OS === "android") {
        // Android requires the base-plan offer token from the subscription's
        // offer details.
        const offerToken = (subscription as SubscriptionAndroid | null)
          ?.subscriptionOfferDetails?.[0]?.offerToken;
        await requestSubscription({
          sku,
          ...(offerToken
            ? { subscriptionOffers: [{ sku, offerToken }] }
            : {}),
        });
      } else {
        await requestSubscription({ sku });
      }
    } catch (err) {
      console.warn("Request subscription error", err);
      Alert.alert("Purchase failed", "Please try again.");
      setLoading(false);
    }
  };

  // iOS Subscription exposes localizedPrice; fall back to a sensible label.
  const price = (subscription as any)?.localizedPrice as string | undefined;
  const label = price ? `Subscribe - ${price}/year` : "Subscribe - $4.99/year";

  return (
    <Button
      onPress={handleBuy}
      size="md"
      action="primary"
      className="w-full"
      style={{ boxShadow: "4px 4px 0px #000" }}
      disabled={loading}
    >
      {loading ? (
        <Spinner />
      ) : (
        <ButtonText className="text-white">{label}</ButtonText>
      )}
    </Button>
  );
}
