import React from "react";
import { FlatList, Image, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { AppText, Pill, RoundButton, Screen } from "../components";
import { PLAYERS } from "../players";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { speakName, tapHaptic } from "../sound";
import { colors } from "../theme";

const GAP = 10;
const BORDER = 4;

export default function AlbumScreen({ t, collected, onBack }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const columns = width >= 700 ? 4 : 3;
  // Card sizes are computed from the screen so every photo keeps the exact 3:4 shape
  // the images were cropped to, and heads are never cut off.
  const listWidth = Math.min(width - insets.left - insets.right - 32, 620);
  const cardWidth = Math.floor((listWidth - GAP * (columns - 1)) / columns);
  const cardSize = { width: cardWidth };
  const photoSize = { width: cardWidth - BORDER * 2, height: Math.round(((cardWidth - BORDER * 2) * 4) / 3) };
  const owned = new Set(collected);
  const complete = owned.size === PLAYERS.length;
  // Pad the last row with empty slots so its cards keep the same width as the others.
  const slots = [...PLAYERS];
  while (slots.length % columns !== 0) slots.push(null);

  return (
    <Screen>
      <View style={styles.topBar}>
        <RoundButton label={t.back} onPress={onBack}>
          <AppText style={styles.backIcon}>‹</AppText>
        </RoundButton>
        <AppText style={styles.title}>📒 {t.album}</AppText>
        <Pill style={styles.countPill}>
          <AppText style={styles.countText}>
            {owned.size} / {PLAYERS.length}
          </AppText>
        </Pill>
      </View>
      <AppText style={styles.hint}>{complete ? t.albumComplete : t.albumHint}</AppText>

      <FlatList
        key={columns}
        data={slots}
        numColumns={columns}
        keyExtractor={(player, i) => player?.id ?? `empty-${i}`}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) =>
          item === null ? (
            <View style={cardSize} />
          ) : owned.has(item.id) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.speak(item.name)}
              onPress={() => {
                tapHaptic();
                speakName(item);
              }}
              style={({ pressed }) => [styles.card, cardSize, pressed && styles.cardPressed]}
            >
              <Image source={item.thumb} style={photoSize} resizeMode="cover" />
              <View style={styles.nameBar}>
                <AppText style={styles.name} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.8}>
                  {item.name}
                </AppText>
              </View>
            </Pressable>
          ) : (
            <View style={[styles.card, cardSize, styles.cardLocked]} accessibilityLabel={t.locked}>
              <View style={photoSize} />
              <View style={styles.nameBar} />
              <View style={styles.lockedCenter}>
                <AppText style={styles.lockedMark}>?</AppText>
              </View>
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  backIcon: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.white
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: "900",
    color: colors.white
  },
  countPill: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  countText: {
    fontSize: 16,
    fontWeight: "900"
  },
  hint: {
    marginTop: 8,
    fontSize: 15,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center"
  },
  list: {
    paddingTop: 12,
    paddingBottom: 12,
    gap: GAP
  },
  row: {
    gap: GAP
  },
  card: {
    borderRadius: 18,
    borderWidth: BORDER,
    borderColor: colors.white,
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  cardPressed: {
    transform: [{ scale: 0.95 }]
  },
  lockedCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  cardLocked: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.4)",
    borderStyle: "dashed"
  },
  lockedMark: {
    fontSize: 44,
    fontWeight: "900",
    color: "rgba(255,255,255,0.7)"
  },
  nameBar: {
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4
  },
  name: {
    fontSize: 12.5,
    fontWeight: "900",
    textAlign: "center"
  }
});
