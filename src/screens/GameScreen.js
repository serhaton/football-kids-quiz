import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Pressable, StyleSheet, View } from "react-native";
import { AppText, ChunkyButton, FitBox, Pill, Pulsing, RoundButton, Screen } from "../components";
import { DIFFICULTIES } from "../game";
import { playSound, resultHaptic, speakName, stopSpeech, tapHaptic } from "../sound";
import { colors, optionColors, shadow } from "../theme";

const TIMEOUT = "timeout";

export default function GameScreen({ t, mode, difficulty, questions, soundOn, onFinish, onExit }) {
  const seconds = DIFFICULTIES[difficulty].seconds;
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState(null);
  const answeredRef = useRef(false);
  const correctIdsRef = useRef([]);
  const speechTimerRef = useRef(null);
  const enter = useRef(new Animated.Value(0)).current;
  const timer = useRef(new Animated.Value(1)).current;

  const question = questions[index];
  const answered = picked !== null;
  const wasCorrect = picked === question.correct.id;
  const score = results.filter(Boolean).length;
  const isLast = index === questions.length - 1;

  const answer = (player) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    timer.stopAnimation();
    clearTimeout(speechTimerRef.current);

    const correct = player?.id === question.correct.id;
    setPicked(player ? player.id : TIMEOUT);
    setResults((prev) => [...prev, correct]);
    setStreak((prev) => (correct ? prev + 1 : 0));
    if (correct) correctIdsRef.current.push(question.correct.id);

    playSound(correct ? "correct" : "wrong");
    resultHaptic(correct);
    // Saying the right name after every answer is how the child actually learns it.
    if (soundOn && mode === "name") {
      speechTimerRef.current = setTimeout(() => speakName(question.correct), 650);
    }
  };

  // Kept in a ref so the countdown always reaches the handler for the question on screen.
  const answerRef = useRef(answer);
  answerRef.current = answer;

  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();

    if (soundOn && mode === "photo") {
      speechTimerRef.current = setTimeout(() => speakName(questions[index].correct), 400);
    }

    let countdown = null;
    if (seconds > 0) {
      timer.setValue(1);
      countdown = Animated.timing(timer, {
        toValue: 0,
        duration: seconds * 1000,
        easing: Easing.linear,
        useNativeDriver: true
      });
      countdown.start(({ finished }) => {
        if (finished) answerRef.current(null);
      });
    }

    return () => {
      clearTimeout(speechTimerRef.current);
      countdown?.stop();
    };
    // Runs once per question; the other values are fixed for the whole game.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => stopSpeech, []);

  const next = () => {
    stopSpeech();
    if (isLast) {
      onFinish({ score, correctIds: correctIdsRef.current });
      return;
    }
    answeredRef.current = false;
    setPicked(null);
    setIndex((prev) => prev + 1);
  };

  const feedback = !answered
    ? null
    : wasCorrect
      ? streak >= 3
        ? `🔥 ${t.streak(streak)}`
        : `🎉 ${t.correct[index % t.correct.length]}`
      : picked === TIMEOUT && mode === "photo"
        ? `⏰ ${t.timeUp}`
        : mode === "name"
          ? `${picked === TIMEOUT ? "⏰" : "💪"} ${t.itIs(question.correct.name)}`
          : `💪 ${t.almost}`;

  const questionStyle = {
    opacity: enter,
    transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }]
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <RoundButton label={t.exit} onPress={onExit} size={42}>
          <AppText style={styles.exitIcon}>✕</AppText>
        </RoundButton>
        <View style={styles.dots} accessibilityLabel={`${index + 1} / ${questions.length}`}>
          {questions.map((item, i) => (
            <View
              key={item.correct.id}
              style={[
                styles.dot,
                i < results.length && (results[i] ? styles.dotGood : styles.dotBad),
                i === index && !answered && styles.dotCurrent
              ]}
            />
          ))}
        </View>
        <Pill style={styles.scorePill}>
          <AppText style={styles.scoreText}>⭐ {score}</AppText>
        </Pill>
      </View>

      {seconds > 0 ? (
        <View style={styles.timerTrack}>
          <Animated.View
            style={[
              styles.timerFill,
              { transform: [{ scaleX: timer }], transformOrigin: "left" }
            ]}
          />
        </View>
      ) : null}

      <Animated.View style={[styles.body, questionStyle]}>
        {mode === "name" ? (
          <NameQuestion t={t} question={question} picked={picked} onAnswer={answer} />
        ) : (
          <PhotoQuestion t={t} question={question} picked={picked} onAnswer={answer} />
        )}
      </Animated.View>

      <View style={styles.footer}>
        {answered ? (
          <>
            <View style={[styles.feedback, wasCorrect ? styles.feedbackGood : styles.feedbackBad]}>
              <AppText style={styles.feedbackText} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.7}>
                {feedback}
              </AppText>
            </View>
            <Pulsing>
              <ChunkyButton onPress={next} radius={18} faceStyle={styles.nextFace} accessibilityLabel={isLast ? t.seeResult : t.next}>
                <AppText style={styles.nextText}>{isLast ? `${t.seeResult} 🏆` : `${t.next} ▶`}</AppText>
              </ChunkyButton>
            </Pulsing>
          </>
        ) : (
          <AppText style={styles.hint}>{mode === "name" ? t.hintName : t.hintPhoto}</AppText>
        )}
      </View>
    </Screen>
  );
}

function SpeakerButton({ player, label, light = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        tapHaptic();
        speakName(player);
      }}
      style={({ pressed }) => [styles.speaker, light && styles.speakerLight, pressed && styles.speakerPressed]}
    >
      <AppText style={styles.speakerIcon}>🔊</AppText>
    </Pressable>
  );
}

// Photo on top, names to choose from below.
function NameQuestion({ t, question, picked, onAnswer }) {
  const answered = picked !== null;
  return (
    <>
      <AppText style={styles.prompt}>{t.questionName}</AppText>
      <FitBox ratio={3 / 4} style={styles.photoArea}>
        <View style={styles.photoFrame}>
          <Image source={question.correct.image} style={styles.photo} resizeMode="cover" />
        </View>
      </FitBox>
      <View style={styles.nameGrid}>
        {question.options.map((player, i) => {
          const isCorrect = player.id === question.correct.id;
          const isPicked = picked === player.id;
          const palette = optionColors[i % optionColors.length];
          let face = palette.face;
          let edge = palette.edge;
          let text = palette.text;
          if (answered && isCorrect) {
            face = colors.good;
            edge = colors.goodEdge;
            text = colors.white;
          } else if (answered && isPicked) {
            face = colors.bad;
            edge = colors.badEdge;
            text = colors.white;
          }
          return (
            <View key={player.id} style={styles.nameCell}>
              <ChunkyButton
                fill
                silent
                color={face}
                edge={edge}
                radius={18}
                disabled={answered}
                dimmed={answered && !isCorrect && !isPicked}
                onPress={() => onAnswer(player)}
                accessibilityLabel={player.name}
                faceStyle={styles.nameFace}
              >
                <AppText
                  style={[styles.nameText, { color: text }]}
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  minimumFontScale={0.75}
                >
                  {answered && isCorrect ? "✓ " : answered && isPicked ? "✗ " : ""}
                  {player.name}
                </AppText>
              </ChunkyButton>
              <SpeakerButton player={player} label={t.speak(player.name)} />
            </View>
          );
        })}
      </View>
    </>
  );
}

// Name on top (spoken aloud), photos to choose from below.
function PhotoQuestion({ t, question, picked, onAnswer }) {
  const answered = picked !== null;
  const rows = [];
  for (let i = 0; i < question.options.length; i += 2) {
    rows.push(question.options.slice(i, i + 2));
  }

  return (
    <>
      <AppText style={styles.prompt}>{t.questionPhoto}</AppText>
      <View style={styles.nameCard}>
        <AppText style={styles.nameCardText} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.6}>
          {question.correct.name}
        </AppText>
        <SpeakerButton player={question.correct} label={t.speak(question.correct.name)} light />
      </View>
      <FitBox ratio={1.5 / rows.length} style={styles.photoGridArea}>
        <View style={styles.photoGrid}>
          {rows.map((row, rowIndex) => (
            <View key={row[0].id} style={styles.photoRow}>
              {row.map((player, columnIndex) => {
                const isCorrect = player.id === question.correct.id;
                const isPicked = picked === player.id;
                const palette = optionColors[(rowIndex * 2 + columnIndex) % optionColors.length];
                const borderColor =
                  answered && isCorrect ? colors.good : answered && isPicked ? colors.bad : palette.face;
                return (
                  <Pressable
                    key={player.id}
                    disabled={answered}
                    accessibilityRole="imagebutton"
                    accessibilityLabel={`${rowIndex * 2 + columnIndex + 1}`}
                    onPress={() => {
                      tapHaptic();
                      onAnswer(player);
                    }}
                    style={({ pressed }) => [
                      styles.photoCell,
                      { borderColor },
                      pressed && styles.photoCellPressed,
                      answered && !isCorrect && !isPicked && styles.photoCellDimmed
                    ]}
                  >
                    <Image source={player.thumb} style={styles.photo} resizeMode="cover" />
                    {answered && (isCorrect || isPicked) ? (
                      <View style={[styles.badge, { backgroundColor: isCorrect ? colors.good : colors.bad }]}>
                        <AppText style={styles.badgeText}>{isCorrect ? "✓" : "✗"}</AppText>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </FitBox>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  exitIcon: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.white
  },
  dots: {
    flex: 1,
    flexDirection: "row",
    gap: 4
  },
  dot: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.28)"
  },
  dotGood: {
    backgroundColor: colors.good
  },
  dotBad: {
    backgroundColor: colors.bad
  },
  dotCurrent: {
    backgroundColor: colors.white
  },
  scorePill: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  scoreText: {
    fontSize: 17,
    fontWeight: "900"
  },
  timerTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden"
  },
  timerFill: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.sun
  },
  body: {
    flex: 1,
    marginTop: 10
  },
  prompt: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
    textShadowColor: "rgba(6,32,79,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  photoArea: {
    marginVertical: 10
  },
  photoFrame: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 6,
    borderColor: colors.white,
    backgroundColor: colors.cardSoft,
    overflow: "hidden",
    ...shadow
  },
  photo: {
    width: "100%",
    height: "100%"
  },
  nameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8
  },
  nameCell: {
    width: "48.5%",
    height: 66
  },
  nameFace: {
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 44
  },
  nameText: {
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  speaker: {
    position: "absolute",
    top: 12,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  speakerLight: {
    position: "relative",
    top: 0,
    right: 0,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.sun
  },
  speakerPressed: {
    transform: [{ scale: 0.9 }]
  },
  speakerIcon: {
    fontSize: 17
  },
  nameCard: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingVertical: 10,
    paddingLeft: 18,
    paddingRight: 10,
    ...shadow
  },
  nameCardText: {
    flex: 1,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center"
  },
  photoGridArea: {
    marginVertical: 12
  },
  photoGrid: {
    flex: 1,
    gap: 10
  },
  photoRow: {
    flex: 1,
    flexDirection: "row",
    gap: 10
  },
  photoCell: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 5,
    backgroundColor: colors.cardSoft,
    overflow: "hidden"
  },
  photoCellPressed: {
    transform: [{ scale: 0.96 }]
  },
  photoCellDimmed: {
    opacity: 0.4
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white
  },
  badgeText: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.white
  },
  footer: {
    height: 66,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  feedback: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  feedbackGood: {
    backgroundColor: colors.goodSoft
  },
  feedbackBad: {
    backgroundColor: colors.badSoft
  },
  feedbackText: {
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  },
  nextFace: {
    height: 53,
    paddingVertical: 0,
    paddingHorizontal: 18
  },
  nextText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.white
  },
  hint: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center"
  }
});
