import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Speech from "expo-speech";
import * as Localization from "expo-localization";

const PLAYERS = [
  { id: "messi", name: "Lionel Messi", image: require("./assets/players/messi.png") },
  { id: "ronaldo", name: "Cristiano Ronaldo", image: require("./assets/players/ronaldo.png") },
  { id: "mbappe", name: "Kylian Mbappé", image: require("./assets/players/mbappe.png") },
  { id: "haaland", name: "Erling Haaland", image: require("./assets/players/haaland.png") },
  { id: "neymar", name: "Neymar", image: require("./assets/players/neymar.png") },
  { id: "salah", name: "Mohamed Salah", image: require("./assets/players/salah.png") },
  { id: "vinicius", name: "Vinícius Júnior", image: require("./assets/players/vinicius.png") },
  { id: "bellingham", name: "Jude Bellingham", image: require("./assets/players/bellingham.png") },
  { id: "debruyne", name: "Kevin De Bruyne", image: require("./assets/players/debruyne.png") },
  { id: "kane", name: "Harry Kane", image: require("./assets/players/kane.png") },
  { id: "modric", name: "Luka Modrić", image: require("./assets/players/modric.png") },
  { id: "lewandowski", name: "Robert Lewandowski", image: require("./assets/players/lewandowski.png") },
  { id: "benzema", name: "Karim Benzema", image: require("./assets/players/benzema.png") },
  { id: "griezmann", name: "Antoine Griezmann", image: require("./assets/players/griezmann.png") },
  { id: "pedri", name: "Pedri", image: require("./assets/players/pedri.png") },
  { id: "rodri", name: "Rodri", image: require("./assets/players/rodri.png") },
  { id: "foden", name: "Phil Foden", image: require("./assets/players/foden.png") },
  { id: "saka", name: "Bukayo Saka", image: require("./assets/players/saka.png") },
  { id: "yamal", name: "Lamine Yamal", image: require("./assets/players/yamal.png") },
  { id: "musiala", name: "Jamal Musiala", image: require("./assets/players/musiala.png") },
  { id: "calhanoglu", name: "Hakan Çalhanoğlu", image: require("./assets/players/calhanoglu.png") },
  { id: "ardaguler", name: "Arda Güler", image: require("./assets/players/ardaguler.png") },
  { id: "kenanyildiz", name: "Kenan Yıldız", image: require("./assets/players/kenanyildiz.png") },
  { id: "orkunkokcu", name: "Orkun Kökçü", image: require("./assets/players/orkunkokcu.png") },
  { id: "merihdemiral", name: "Merih Demiral", image: require("./assets/players/merihdemiral.png") }
];

const TOTAL_ROUNDS = 10;

const TRANSLATIONS = {
  en: {
    title: "Find the Footballer!",
    introTitle: "Welcome to Football Kids Quiz!",
    introSubtitle: "Learn football stars with a fun photo quiz.",
    startGame: "Play",
    question: "Who's the footballer?",
    hint: "Tap the speaker to hear the name!",
    next: "Next",
    showResult: "See Result",
    restart: "Restart",
    exit: "Exit",
    scoreLabel: "Score",
    noPhoto: "No photo",
    bravo: "Great job!",
    tryAgain: "Let's try again!",
    loadingTitle: "Next Question Loading...",
    loadingSubtitle: "Getting the ball ready",
    settings: "Settings",
    language: "Language",
    useDeviceLanguage: "Use phone language",
    english: "English",
    turkish: "Turkish",
    close: "Close",
    finalTitle: "Awesome!",
    playAgain: "Play Again",
    finalPerfect: "Perfect! You guessed all football players!",
    finalGreat: "Very good! You are becoming a football expert!",
    finalGood: "Great! Shall we play a little more?"
  },
  tr: {
    title: "Futbolcuyu Bul!",
    introTitle: "Football Kids Quiz'e Hoş Geldin!",
    introSubtitle: "Eğlenceli fotoğraf oyunu ile futbol yıldızlarını öğren.",
    startGame: "Başla",
    question: "Kim bu futbolcu?",
    hint: "İsmi duymak için hoparlöre bas!",
    next: "Sonraki",
    showResult: "Sonucu Gör",
    restart: "Yeniden Başlat",
    exit: "Çıkış",
    scoreLabel: "Skor",
    noPhoto: "Foto yok",
    bravo: "Bravo!",
    tryAgain: "Bir daha deneyelim!",
    loadingTitle: "Sonraki Soru Geliyor...",
    loadingSubtitle: "Top hazırlanıyor",
    settings: "Ayarlar",
    language: "Dil",
    useDeviceLanguage: "Telefon dilini kullan",
    english: "İngilizce",
    turkish: "Türkçe",
    close: "Kapat",
    finalTitle: "Harika!",
    playAgain: "Tekrar Oyna",
    finalPerfect: "Mükemmel! Bütün futbolcuları bildin!",
    finalGreat: "Çok iyi! Futbol uzmanı oluyorsun!",
    finalGood: "Süper! Biraz daha oynayalım mı?"
  }
};

function getDeviceLanguage() {
  const locale = Localization.getLocales?.()?.[0];
  if (locale?.languageCode === "tr") return "tr";
  return "en";
}

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function makeQuestion(correct) {
  const wrong = shuffle(PLAYERS.filter((p) => p.id !== correct.id)).slice(0, 3);
  return { correct, options: shuffle([correct, ...wrong]) };
}

function makeGameQuestions() {
  return shuffle(PLAYERS).slice(0, TOTAL_ROUNDS).map(makeQuestion);
}

function speak(text, language) {
  Speech.stop();
  const voiceLanguage = language === "tr" ? "tr-TR" : "en-US";
  Speech.speak(text, { language: voiceLanguage, rate: 0.78, pitch: 1.05 });
}

export default function App() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = height < 760;
  const isLargeTablet = width >= 1000;
  const nextQuestionTimerRef = useRef(null);
  const deviceLanguage = getDeviceLanguage();
  const [questions, setQuestions] = useState(() => makeGameQuestions());
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [finished, setFinished] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [languagePreference, setLanguagePreference] = useState("system");
  const [settingsVisible, setSettingsVisible] = useState(false);

  const currentLanguage = languagePreference === "system" ? deviceLanguage : languagePreference;
  const t = TRANSLATIONS[currentLanguage];

  const question = questions[round - 1];
  const progress = Math.min(((round - 1) / TOTAL_ROUNDS) * 100, 100);

  const choose = (player) => {
    if (selectedId || finished || !gameStarted) return;
    setSelectedId(player.id);
    if (player.id === question.correct.id) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (isTransitioning || !selectedId || !gameStarted) return;
    if (round >= TOTAL_ROUNDS) {
      setFinished(true);
      return;
    }
    setIsTransitioning(true);
    nextQuestionTimerRef.current = setTimeout(() => {
      setRound((prev) => prev + 1);
      setSelectedId(null);
      setIsTransitioning(false);
    }, 700);
  };

  const resetGame = () => {
    if (nextQuestionTimerRef.current) {
      clearTimeout(nextQuestionTimerRef.current);
      nextQuestionTimerRef.current = null;
    }
    setQuestions(makeGameQuestions());
    setRound(1);
    setScore(0);
    setSelectedId(null);
    setFinished(false);
    setIsTransitioning(false);
  };

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  const restartGame = () => {
    resetGame();
    setGameStarted(true);
  };

  const exitGame = () => {
    resetGame();
    setGameStarted(false);
  };

  const settingsModal = (
    <Modal
      visible={settingsVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setSettingsVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{t.settings}</Text>
          <Text style={styles.modalLabel}>{t.language}</Text>

          <Pressable
            style={[
              styles.languageOption,
              languagePreference === "system" && styles.languageOptionActive
            ]}
            onPress={() => setLanguagePreference("system")}
          >
            <Text style={styles.languageOptionText}>
              {t.useDeviceLanguage} ({deviceLanguage === "tr" ? "Türkçe" : "English"})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.languageOption,
              languagePreference === "en" && styles.languageOptionActive
            ]}
            onPress={() => setLanguagePreference("en")}
          >
            <Text style={styles.languageOptionText}>{t.english}</Text>
          </Pressable>

          <Pressable
            style={[
              styles.languageOption,
              languagePreference === "tr" && styles.languageOptionActive
            ]}
            onPress={() => setLanguagePreference("tr")}
          >
            <Text style={styles.languageOptionText}>{t.turkish}</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={() => setSettingsVisible(false)}>
            <Text style={styles.closeButtonText}>{t.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => () => {
    if (nextQuestionTimerRef.current) {
      clearTimeout(nextQuestionTimerRef.current);
    }
  }, []);

  if (finished) {
    const finalSubtitle =
      score === TOTAL_ROUNDS
        ? t.finalPerfect
        : score >= 7
          ? t.finalGreat
          : t.finalGood;

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.endCard}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.endTitle}>{t.finalTitle} 🎉</Text>
          <Text style={styles.bigScore}>{score} / {TOTAL_ROUNDS}</Text>
          <Text style={styles.subtitle}>{finalSubtitle} ⚽</Text>
          <Pressable style={styles.primaryButton} onPress={restartGame}>
            <Text style={styles.primaryText}>{t.playAgain} 🔄</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={exitGame}>
            <Text style={styles.secondaryButtonText}>{t.exit}</Text>
          </Pressable>
        </View>
        {settingsModal}
      </SafeAreaView>
    );
  }

  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.introScreen}>
          <View style={styles.introTopBar}>
            <Pressable style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </Pressable>
          </View>
          <View style={styles.introCard}>
            <Text style={styles.trophy}>⚽</Text>
            <Text style={styles.introTitle}>{t.introTitle}</Text>
            <Text style={styles.introSubtitle}>{t.introSubtitle}</Text>
            <Pressable style={styles.primaryButton} onPress={startGame}>
              <Text style={styles.primaryText}>{t.startGame} ▶️</Text>
            </Pressable>
          </View>
        </View>
        {settingsModal}
      </SafeAreaView>
    );
  }

  if (isTransitioning) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingScreen}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#0b5cff" />
            <Text style={styles.loadingTitle}>{t.loadingTitle}</Text>
            <Text style={styles.loadingSubtitle}>{t.loadingSubtitle} ⚽</Text>
          </View>
        </View>
        {settingsModal}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>⚽ {t.title}</Text>
          <View style={styles.topBarRight}>
            <Pressable style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </Pressable>
            <View style={styles.scorePill}>
              <Text style={styles.scoreText}>⭐ {score}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{round} / {TOTAL_ROUNDS}</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={restartGame}>
            <Text style={styles.actionButtonText}>🔄 {t.restart}</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={exitGame}>
            <Text style={styles.actionButtonText}>⏹ {t.exit}</Text>
          </Pressable>
        </View>

        <View style={[
          styles.card,
          isSmallScreen && styles.cardSmall,
          isLargeTablet && styles.cardTablet
        ]}>
          <Text style={styles.question}>{t.question} 🤔</Text>

          <View style={[
            styles.photoFrame,
            isSmallScreen && styles.photoFrameSmall,
            isLargeTablet && styles.photoFrameTablet
          ]}>
            <Image
              source={question.correct.image}
              style={styles.photo}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.optionsGrid, isLargeTablet && styles.optionsGridTablet]}>
            {question.options.map((player) => {
              const isCorrect = selectedId && player.id === question.correct.id;
              const isWrong = selectedId === player.id && player.id !== question.correct.id;

              return (
                <View key={player.id} style={[styles.optionRow, isLargeTablet && styles.optionRowTablet]}>
                  <Pressable
                    onPress={() => choose(player)}
                    style={[
                      styles.answerButton,
                      isLargeTablet && styles.answerButtonTablet,
                      isCorrect && styles.correctAnswer,
                      isWrong && styles.wrongAnswer
                    ]}
                  >
                    <Text style={styles.answerText}>{player.name}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => speak(player.name, currentLanguage)}
                    style={[styles.speakButton, isLargeTablet && styles.speakButtonTablet]}
                    accessibilityLabel={`${player.name} seslendir`}
                  >
                    <Text style={styles.speakText}>🔊</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {selectedId && (
            <View style={[
              styles.feedback,
              selectedId === question.correct.id ? styles.feedbackGood : styles.feedbackTry
            ]}>
              <Text style={styles.feedbackText}>
                {selectedId === question.correct.id ? `🎉 ${t.bravo}` : `💪 ${t.tryAgain}`}
              </Text>
            </View>
          )}

          {selectedId && (
            <Pressable style={styles.nextButton} onPress={next}>
              <Text style={styles.nextButtonText}>
                {round === TOTAL_ROUNDS ? `${t.showResult} 🏆` : `${t.next} ⚽`}
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.hint, isLargeTablet && styles.hintTablet]}>🔊 {t.hint}</Text>
      </View>
      {settingsModal}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef5ff"
  },
  app: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8
  },
  introScreen: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
    justifyContent: "center"
  },
  introTopBar: {
    position: "absolute",
    top: 8,
    right: 12,
    zIndex: 2
  },
  introCard: {
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center"
  },
  introTitle: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    color: "#10213d"
  },
  introSubtitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#5b718c"
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  logo: {
    fontSize: 24,
    fontWeight: "900",
    color: "#10213d"
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  settingsButtonText: {
    fontSize: 20
  },
  scorePill: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  scoreText: {
    fontWeight: "800",
    fontSize: 18,
    color: "#10213d"
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#d7e5f5",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0b5cff"
  },
  progressLabel: {
    fontWeight: "800",
    color: "#55708f"
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#355172"
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 26,
    padding: 12
  },
  cardSmall: {
    padding: 10
  },
  cardTablet: {
    flex: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14
  },
  question: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 10,
    color: "#10213d"
  },
  photoFrame: {
    width: "74%",
    maxWidth: 360,
    aspectRatio: 3 / 4,
    alignSelf: "center",
    borderRadius: 20,
    backgroundColor: "#dcecff",
    marginBottom: 10,
    overflow: "hidden"
  },
  photoFrameSmall: {
    width: "68%"
  },
  photoFrameTablet: {
    width: "58%",
    maxWidth: 460,
    aspectRatio: 4 / 5,
    marginBottom: 8
  },
  photo: {
    width: "100%",
    height: "100%"
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8
  },
  optionsGridTablet: {
    rowGap: 6
  },
  optionRow: {
    width: "49%",
    flexDirection: "row",
    gap: 6,
    minHeight: 52
  },
  optionRowTablet: {
    minHeight: 48
  },
  answerButton: {
    flex: 1,
    backgroundColor: "#f1f6fc",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  answerButtonTablet: {
    paddingVertical: 6
  },
  answerText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#10213d",
    textAlign: "center"
  },
  speakButton: {
    width: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6efff"
  },
  speakButtonTablet: {
    width: 40
  },
  speakText: {
    fontSize: 20
  },
  correctAnswer: {
    backgroundColor: "#c9f8d4"
  },
  wrongAnswer: {
    backgroundColor: "#ffd3d3"
  },
  feedback: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: "center"
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#10213d"
  },
  feedbackGood: {
    backgroundColor: "#c9f8d4"
  },
  feedbackTry: {
    backgroundColor: "#fff1c7"
  },
  nextButton: {
    marginTop: 8,
    backgroundColor: "#0b5cff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900"
  },
  hint: {
    marginTop: 8,
    textAlign: "center",
    color: "#637d99",
    fontWeight: "700"
  },
  hintTablet: {
    marginTop: 12,
    marginBottom: 4
  },
  endCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  trophy: {
    fontSize: 84
  },
  endTitle: {
    marginTop: 10,
    fontSize: 44,
    fontWeight: "900",
    color: "#10213d"
  },
  bigScore: {
    marginTop: 10,
    fontSize: 58,
    fontWeight: "900",
    color: "#0b5cff"
  },
  subtitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#5b718c"
  },
  primaryButton: {
    marginTop: 16,
    minWidth: "80%",
    backgroundColor: "#0b5cff",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center"
  },
  primaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 20
  },
  secondaryButton: {
    marginTop: 10,
    minWidth: "80%",
    borderWidth: 2,
    borderColor: "#0b5cff",
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#0b5cff",
    fontWeight: "900",
    fontSize: 18
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  loadingCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center"
  },
  loadingTitle: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "900",
    color: "#10213d",
    textAlign: "center"
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "700",
    color: "#5b718c",
    textAlign: "center"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16,33,61,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 18
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#10213d"
  },
  modalLabel: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#55708f"
  },
  languageOption: {
    borderWidth: 2,
    borderColor: "#dce7f6",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#f7fbff"
  },
  languageOptionActive: {
    borderColor: "#0b5cff",
    backgroundColor: "#e9f0ff"
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10213d"
  },
  closeButton: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b5cff"
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900"
  }
});
