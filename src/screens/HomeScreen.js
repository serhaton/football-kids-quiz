import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText, Bouncing, ChunkyButton, Pill, RoundButton, Screen, Segmented } from "../components";
import { DIFFICULTIES, TOTAL_ROUNDS, bestKey, rankForStars } from "../game";
import { PLAYERS } from "../players";
import { colors } from "../theme";

const DIFFICULTY_EMOJI = { easy: "🌱", medium: "⚡", hard: "🔥" };

export default function HomeScreen({ t, store, onSelect, onPlay, onAlbum, onSettings, onToggleSound }) {
  const rank = rankForStars(store.stars);
  const best = store.best[bestKey(store.mode, store.difficulty)];
  const modeHint = store.mode === "name" ? t.modeNameHint : t.modePhotoHint;

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pill>
          <AppText style={styles.pillText}>
            ⭐ {store.stars} · {t.ranks[rank.index]}
          </AppText>
        </Pill>
        <View style={styles.topBarRight}>
          <RoundButton label={store.soundOn ? t.soundOn : t.soundOff} onPress={onToggleSound}>
            <AppText style={styles.icon}>{store.soundOn ? "🔊" : "🔇"}</AppText>
          </RoundButton>
          <RoundButton label={t.settings} onPress={onSettings}>
            <AppText style={styles.icon}>⚙️</AppText>
          </RoundButton>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.hero}>
          <Bouncing>
            <AppText style={styles.ball}>⚽</AppText>
          </Bouncing>
          <AppText style={styles.title} adjustsFontSizeToFit numberOfLines={1}>
            {t.appTitle}
          </AppText>
        </View>

        <View style={styles.choices}>
          <Segmented
            large
            value={store.mode}
            onChange={(mode) => onSelect({ mode })}
            options={[
              { id: "name", label: `🧐 ${t.modeName}`, accessibilityLabel: `${t.modeName}. ${t.modeNameHint}` },
              { id: "photo", label: `🖼️ ${t.modePhoto}`, accessibilityLabel: `${t.modePhoto}. ${t.modePhotoHint}` }
            ]}
          />
          <AppText style={styles.hint}>{modeHint}</AppText>

          <Segmented
            value={store.difficulty}
            onChange={(difficulty) => onSelect({ difficulty })}
            options={Object.keys(DIFFICULTIES).map((id) => ({
              id,
              label: `${DIFFICULTY_EMOJI[id]} ${t.difficulty[id]}`
            }))}
          />
        </View>

        <ChunkyButton onPress={onPlay} radius={26} depth={7} faceStyle={styles.playFace} accessibilityLabel={t.play}>
          <AppText style={styles.playText}>▶  {t.play}</AppText>
        </ChunkyButton>
        <AppText style={styles.best}>{best === undefined ? " " : `🏆 ${t.best(best, TOTAL_ROUNDS)}`}</AppText>

        <ChunkyButton
          onPress={onAlbum}
          color={colors.white}
          edge={colors.neutralEdge}
          accessibilityLabel={`${t.album} ${store.collected.length} / ${PLAYERS.length}`}
        >
          <AppText style={styles.albumText}>
            📒 {t.album}  ·  {store.collected.length} / {PLAYERS.length}
          </AppText>
        </ChunkyButton>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  topBarRight: {
    flexDirection: "row",
    gap: 10
  },
  pillText: {
    fontSize: 16,
    fontWeight: "900"
  },
  icon: {
    fontSize: 20
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 10
  },
  hero: {
    alignItems: "center"
  },
  ball: {
    fontSize: 84,
    lineHeight: 100
  },
  title: {
    marginTop: 4,
    fontSize: 38,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
    textShadowColor: "rgba(6,32,79,0.35)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6
  },
  choices: {
    marginTop: 28,
    marginBottom: 24
  },
  hint: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center"
  },
  playFace: {
    paddingVertical: 18
  },
  playText: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 0.5
  },
  best: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 15,
    color: colors.white,
    textAlign: "center"
  },
  albumText: {
    fontSize: 18,
    fontWeight: "900"
  }
});
