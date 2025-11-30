import React, { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  getProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  Product,
  Purchase,
} from "react-native-iap";
import { setHasPaid } from "../utils/mmkvStorage";
import { Button, ButtonText } from "./ui/button";
import { Spinner } from "./ui/Spinner";

const sku = Platform.select({
  ios: "gin_premium_ios", // product id
  android: "gin_premium_android",
});

export default function BuyButton({ onSuccess }: { onSuccess?: () => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let purchaseUpdateSub: any;
    let purchaseErrorSub: any;

    const init = async () => {
      try {
        const products = await getProducts({ skus: [sku!] });
        setProduct(products[0]);
      } catch (err) {
        console.warn("Error loading IAP products", err);
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
        console.warn("Purchase error", error);
        Alert.alert("Purchase failed", error.message);
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
      await requestPurchase({ sku: sku! });
    } catch (err) {
      console.warn("Request purchase error", err);
      Alert.alert("Purchase failed", "Please try again.");
      setLoading(false);
    }
  };

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
        <ButtonText className="text-white">
          {product
            ? `Buy ${product.title} - ${product.localizedPrice}`
            : "Loading..."}
        </ButtonText>
      )}
    </Button>
  );
}
