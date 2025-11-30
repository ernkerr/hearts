import React from "react";
import { View, Pressable, Text } from "react-native";

export const COLOR_PICKER_PALETTE = [
  "#a51c30",
  "#FF0000",
  "#FF3D00",
  "#FF4910",
  "#FF6F59",

  // orange
  "#f75c03",
  "#ff7900",

  "#ff9100",
  "#ffbe0b",

  // yellow
  "#FFFF00",
  "#fdfe02",

  // green
  "#caff8a", // my fav

  "#affc41",
  "#29bf12",
  "#2FFF2F",
  "#04e762",
  "#70e000",

  // blue green
  "#7bf1a8",

  "#80ffdb",
  "#72efdd",
  "#41ead4",
  "#64dfdf",

  "#7DF9FF",
  "#00C2FF",
  "#26ABFF",

  "#B967FF",
  "#8338ec",
  "#FFFFFF",
  "#FF01F6",
  "#FF218C",
  // Add more colors here
];

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  const perRow = 5;
  const rows = [];
  for (let i = 0; i < COLOR_PICKER_PALETTE.length; i += perRow) {
    rows.push(COLOR_PICKER_PALETTE.slice(i, i + perRow));
  }

  return (
    <View style={{ alignItems: "center", marginBottom: 16 }}>
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: rowIdx < rows.length - 1 ? 16 : 0,
          }}
        >
          {row.map((c, idx) => (
            <Pressable
              key={c}
              onPress={() => onSelect(c)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: c,
                borderWidth: selectedColor === c ? 3 : 1,
                borderColor: selectedColor === c ? "#000" : "#ccc",
                justifyContent: "center",
                alignItems: "center",
                marginRight: idx < row.length - 1 ? 16 : 0,
              }}
              accessibilityLabel={`Select color ${c}`}
            >
              {selectedColor === c && (
                <Text
                  style={{ color: "#000", fontWeight: "bold", fontSize: 18 }}
                >
                  ✓
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
