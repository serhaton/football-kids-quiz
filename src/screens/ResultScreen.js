import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, ChunkyButton, Confetti, PopIn, Screen } from "../components";
import { TOTAL_ROUNDS } from "../game";
import { playSound } from "../sound";
import { colors, shadow } from "../theme";

export default function ResultScreen({ t, result, onReplay, onHome, onAlbum }) {
  const { score, stars, isRecord, newCards } = result;

  useEffect(() => {
    if (stars > 0) playSound("win");
  }, [stars]);

  const [title, subtitle] =
    stars === 3
      ? [t.resultPerfect, t.resultPerfectSub]
      : stars === 2
        ? [t.resultGreat, t.resultGreatSub]
        : stars === 1
          ? [t.resultGood, t.resultGoodSub]
          : [t.resultTry, t.resultTrySub];

  return (
    <Screen>
      <View style={styles.center}>
        <PopIn style={styles.card}>
          <AppText style={styles.trophy}>{stars > 0 ? "🏆" : "⚽"}</AppText>
          <AppText style={styles.title} adjustsFontSizeToFit numberOfLines={1}>
            {title}
          </AppText>

          <View style={styles.stars} accessibilityLabel={`${stars} / 3 ⭐`}>
            {[1, 2, 3].map((n) =>
              n <= stars ? (
                <PopIn key={n} delay={500 + n * 320} onShown={() => playSound("star")}>
                  <AppText style={[styles.star, n === 2 && styles.starMiddle]}>⭐</AppText>
                </PopIn>
              ) : (
                <AppText key={n} style={[styles.star, styles.starEmpty, n === 2 && styles.starMiddle]}>
                  ⭐
                </AppText>
              )
            )}
          </View>

          <AppText style={styles.score}>
            {score} <AppText style={styles.scoreTotal}>/ {TOTAL_ROUNDS}</AppText>
          </AppText>
          <AppText style={styles.subtitle}>{subtitle}</AppText>

          {isRecord ? (
            <View style={[styles.chip, styles.chipRecord]}>
              <AppText style={styles.chipText}>🎖️ {t.newRecord}</AppText>
            </View>
          ) : null}
          {newCards > 0 ? (
            <View style={[styles.chip, styles.chipCards]}>
              <AppText style={styles.chipText}>📒 {t.newCards(newCards)}</AppText>
            </View>
          ) : null}
        </PopIn>

        <ChunkyButton onPress={onReplay} radius={24} depth={6} style={styles.button} faceStyle={styles.replayFace}>
          <AppText style={styles.replayText}>🔄 {t.playAgain}</AppText>
        </ChunkyButton>
        <View style={styles.row}>
          <ChunkyButton fill onPress={onHome} color={colors.white} edge={colors.neutralEdge}>
            <AppText style={styles.secondaryText}>🏠 {t.home}</AppText>
          </ChunkyButton>
          <ChunkyButton fill onPress={onAlbum} color={colors.accent} edge={colors.accentEdge}>
            <AppText style={[styles.secondaryText, styles.onColor]}>📒 {t.album}</AppText>
          </ChunkyButton>
        </View>
      </View>
      {stars > 0 ? <Confetti count={stars * 16} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center"
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 32,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    ...shadow
  },
  trophy: {
    fontSize: 64,
    lineHeight: 78
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center"
  },
  stars: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 70
  },
  star: {
    fontSize: 46,
    lineHeight: 58
  },
  starMiddle: {
    fontSize: 56,
    lineHeight: 70
  },
  starEmpty: {
    opacity: 0.18
  },
  score: {
    marginTop: 4,
    fontSize: 60,
    fontWeight: "900",
    color: colors.bgTop
  },
  scoreTotal: {
    fontSize: 30,
    color: colors.inkSoft
  },
  subtitle: {
    marginTop: 2,
    fontSize: 17,
    color: colors.inkSoft,
    textAlign: "center"
  },
  chip: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  chipRecord: {
    backgroundColor: "#FFF1C2"
  },
  chipCards: {
    backgroundColor: colors.cardSoft
  },
  chipText: {
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center"
  },
  button: {
    marginTop: 18
  },
  replayFace: {
    paddingVertical: 15
  },
  replayText: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.white
  },
  row: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12
  },
  secondaryText: {
    fontSize: 17,
    fontWeight: "900"
  },
  onColor: {
    color: colors.white
  }
});
