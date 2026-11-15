import React, { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Screen } from "./src/components";
import { bestKey, makeQuestions, starsForScore } from "./src/game";
import { TRANSLATIONS, getDeviceLanguage } from "./src/i18n";
import { CreditsSheet, ModalHost, ParentalGateSheet, SettingsSheet } from "./src/modals";
import AlbumScreen from "./src/screens/AlbumScreen";
import GameScreen from "./src/screens/GameScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ResultScreen from "./src/screens/ResultScreen";
import { initSounds, setSoundEnabled } from "./src/sound";
import { loadStore, saveStore } from "./src/storage";

export default function App() {
  const [store, setStore] = useState(null);
  const [screen, setScreen] = useState("home");
  const [game, setGame] = useState(null);
  const [result, setResult] = useState(null);
  const [modal, setModal] = useState(null);
  const pendingActionRef = useRef(null);
  const deviceLanguage = getDeviceLanguage();

  useEffect(() => {
    initSounds();
    loadStore().then((loaded) => {
      setSoundEnabled(loaded.soundOn);
      setStore(loaded);
    });
  }, []);

  const updateStore = (patch) => {
    setStore((prev) => {
      const nextStore = { ...prev, ...patch };
      saveStore(nextStore);
      return nextStore;
    });
    if (typeof patch.soundOn === "boolean") setSoundEnabled(patch.soundOn);
  };

  if (!store) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Screen />
      </SafeAreaProvider>
    );
  }

  const language = store.language === "system" ? deviceLanguage : store.language;
  const t = TRANSLATIONS[language];

  const startGame = () => {
    setGame({
      id: Date.now(),
      mode: store.mode,
      difficulty: store.difficulty,
      questions: makeQuestions(store.collected, store.difficulty)
    });
    setScreen("game");
  };

  const finishGame = ({ score, correctIds }) => {
    const key = bestKey(game.mode, game.difficulty);
    const previousBest = store.best[key];
    const stars = starsForScore(score);
    const newIds = correctIds.filter((id) => !store.collected.includes(id));

    setResult({
      score,
      stars,
      isRecord: score > 0 && (previousBest === undefined || score > previousBest),
      newCards: newIds.length
    });
    updateStore({
      stars: store.stars + stars,
      collected: [...store.collected, ...newIds],
      best: { ...store.best, [key]: Math.max(previousBest ?? 0, score) }
    });
    setScreen("result");
  };

  // Everything meant for parents (settings, links that leave the app) goes through the gate.
  const openGate = (action) => {
    pendingActionRef.current = action;
    setModal("gate");
  };

  const requestExternalLink = (url) => {
    if (url) openGate({ url });
  };

  const closeGate = () => {
    pendingActionRef.current = null;
    setModal(null);
  };

  const passGate = () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action?.settings) {
      setModal("settings");
      return;
    }
    setModal(null);
    // Failing to open a link is not worth interrupting anyone for.
    if (action?.url) Linking.openURL(action.url).catch(() => {});
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      {screen === "home" ? (
        <HomeScreen
          t={t}
          store={store}
          onSelect={updateStore}
          onPlay={startGame}
          onAlbum={() => setScreen("album")}
          onSettings={() => openGate({ settings: true })}
          onToggleSound={() => updateStore({ soundOn: !store.soundOn })}
        />
      ) : null}

      {screen === "game" && game ? (
        <GameScreen
          key={game.id}
          t={t}
          mode={game.mode}
          difficulty={game.difficulty}
          questions={game.questions}
          soundOn={store.soundOn}
          onFinish={finishGame}
          onExit={() => setScreen("home")}
        />
      ) : null}

      {screen === "result" && result ? (
        <ResultScreen
          t={t}
          result={result}
          onReplay={startGame}
          onHome={() => setScreen("home")}
          onAlbum={() => setScreen("album")}
        />
      ) : null}

      {screen === "album" ? (
        <AlbumScreen t={t} collected={store.collected} onBack={() => setScreen("home")} />
      ) : null}

      <ModalHost modal={modal} onClose={modal === "gate" ? closeGate : () => setModal(null)}>
        {(current) =>
          current === "settings" ? (
            <SettingsSheet
              t={t}
              store={store}
              deviceLanguage={deviceLanguage}
              onChange={updateStore}
              onOpenCredits={() => setModal("credits")}
              onOpenLink={requestExternalLink}
              onClose={() => setModal(null)}
            />
          ) : current === "credits" ? (
            <CreditsSheet t={t} onOpenLink={requestExternalLink} onClose={() => setModal("settings")} />
          ) : current === "gate" ? (
            <ParentalGateSheet t={t} visible={modal === "gate"} onPass={passGate} onCancel={closeGate} />
          ) : null
        }
      </ModalHost>
    </SafeAreaProvider>
  );
}
