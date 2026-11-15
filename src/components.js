import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontFamily, shadow } from "./theme";
import { playSound, tapHaptic } from "./sound";

export function AppText({ style, children, ...rest }) {
  return (
    <Text maxFontSizeMultiplier={1.25} {...rest} style={[styles.text, style]}>
      {children}
    </Text>
  );
}

// Gradient backdrop with soft decorative shapes, plus safe-area padding and a
// centred column so phones and tablets share one layout.
export function Screen({ children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, styles.blobOne]} />
        <View style={[styles.blob, styles.blobTwo]} />
        <View style={[styles.blob, styles.blobThree]} />
      </View>
      <View
        style={[
          styles.screenContent,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingLeft: insets.left + 16,
            paddingRight: insets.right + 16
          }
        ]}
      >
        <View style={styles.column}>{children}</View>
      </View>
    </View>
  );
}

// A button with a darker "edge" underneath that the face sinks into when pressed.
export function ChunkyButton({
  onPress,
  color = colors.primary,
  edge = colors.primaryEdge,
  radius = 20,
  depth = 5,
  disabled = false,
  dimmed = false,
  silent = false,
  fill = false,
  style,
  faceStyle,
  children,
  accessibilityLabel,
  accessibilityState
}) {
  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPress={() => {
        if (!silent) playSound("tap");
        tapHaptic();
        onPress?.();
      }}
      style={[fill && styles.fill, dimmed && styles.dimmed, style]}
    >
      {({ pressed }) => (
        <View style={[{ backgroundColor: edge, borderRadius: radius, paddingBottom: depth }, fill && styles.fillInner]}>
          <View
            style={[
              styles.buttonFace,
              { backgroundColor: color, borderRadius: radius },
              fill && styles.fillInner,
              pressed && { transform: [{ translateY: depth - 1 }] },
              faceStyle
            ]}
          >
            {children}
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function RoundButton({ onPress, label, children, size = 46 }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        playSound("tap");
        tapHaptic();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.roundButton,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.roundButtonPressed
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Pill({ children, style }) {
  return <View style={[styles.pill, style]}>{children}</View>;
}

// A two-or-more way switch: the selected choice sits on a white thumb.
export function Segmented({ options, value, onChange, large = false }) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              playSound("tap");
              tapHaptic();
              onChange(option.id);
            }}
            style={[styles.segment, large && styles.segmentLarge, active && styles.segmentActive]}
          >
            <AppText
              style={[styles.segmentText, large && styles.segmentTextLarge, active && styles.segmentTextActive]}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.7}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// Blinks and swells gently to draw the eye, e.g. to the "Next" button.
export function Pulsing({ children, style }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration: 520, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 520, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [value]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] }),
          transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Fills the available space with the largest centred box of the given width/height ratio,
// so photos inside it are never cropped differently on different screen sizes.
export function FitBox({ ratio, style, children }) {
  const [size, setSize] = useState(null);
  return (
    <View
      style={[styles.fitArea, style]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        const boxWidth = Math.floor(Math.min(width, height * ratio));
        setSize((prev) => (prev && prev.width === boxWidth ? prev : { width: boxWidth, height: Math.floor(boxWidth / ratio) }));
      }}
    >
      {size ? <View style={size}>{children}</View> : null}
    </View>
  );
}

// Gentle endless bounce used for the ball mascot.
export function Bouncing({ children, distance = 12, duration = 620 }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration, easing: Easing.in(Easing.quad), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration]);
  const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] });
  return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
}

// Scales its children in with a springy pop, optionally after a delay.
export function PopIn({ children, delay = 0, style, onShown }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      onShown?.();
      Animated.spring(value, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(timer);
    // The animation should run once per mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Animated.View style={[style, { opacity: value, transform: [{ scale: value }] }]}>{children}</Animated.View>;
}

const CONFETTI_COLORS = [colors.sun, colors.coral, colors.teal, colors.primary, colors.white, colors.accent];

export function Confetti({ count = 36 }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        left: Math.random() * width,
        size: 8 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        drift: (Math.random() - 0.5) * 120,
        spin: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 4),
        duration: 2400 + Math.random() * 1800,
        delay: Math.random() * 900,
        round: i % 3 === 0,
        value: new Animated.Value(0)
      })),
    [count, width]
  );

  useEffect(() => {
    const animations = pieces.map((piece) =>
      Animated.timing(piece.value, {
        toValue: 1,
        duration: piece.duration,
        delay: piece.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true
      })
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [pieces]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <Animated.View
          key={piece.key}
          style={{
            position: "absolute",
            top: -24,
            left: piece.left,
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 1.6,
            borderRadius: piece.round ? piece.size / 2 : 2,
            backgroundColor: piece.color,
            transform: [
              { translateY: piece.value.interpolate({ inputRange: [0, 1], outputRange: [0, height + 60] }) },
              { translateX: piece.value.interpolate({ inputRange: [0, 1], outputRange: [0, piece.drift] }) },
              {
                rotate: piece.value.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${piece.spin * 180}deg`]
                })
              }
            ]
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily,
    color: colors.ink,
    fontWeight: "800"
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bgMid
  },
  screenContent: {
    flex: 1,
    alignItems: "center"
  },
  column: {
    flex: 1,
    width: "100%",
    maxWidth: 620
  },
  blob: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999
  },
  blobOne: {
    width: 280,
    height: 280,
    top: -90,
    right: -80
  },
  blobTwo: {
    width: 200,
    height: 200,
    top: "38%",
    left: -110
  },
  blobThree: {
    width: 340,
    height: 340,
    bottom: -150,
    right: -120
  },
  fill: {
    flex: 1
  },
  // Grows to fill a fixed-height parent but keeps its content height when the parent is auto-sized.
  fillInner: {
    flexGrow: 1
  },
  dimmed: {
    opacity: 0.45
  },
  buttonFace: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  segmented: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
    borderRadius: 22,
    backgroundColor: "rgba(6,32,79,0.28)"
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 18
  },
  segmentLarge: {
    paddingVertical: 15
  },
  segmentActive: {
    backgroundColor: colors.white,
    ...shadow,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  segmentText: {
    fontSize: 16,
    fontWeight: "900",
    color: "rgba(255,255,255,0.92)"
  },
  segmentTextLarge: {
    fontSize: 20
  },
  segmentTextActive: {
    color: colors.ink
  },
  fitArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  roundButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glassStrong,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)"
  },
  roundButtonPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: "rgba(255,255,255,0.4)"
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14
  }
});
