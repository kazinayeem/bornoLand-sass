import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "./src/context/AppContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { motion, ThemeProvider, useTheme } from "./src/theme";

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApplication />
    </ThemeProvider>
  );
}

function ThemedApplication() {
  const { theme, ready, resolvedMode } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    opacity.setValue(0.72);
    const animation = Animated.timing(opacity, { toValue: 1, duration: motion.normal, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start(); return () => animation.stop();
  }, [opacity, resolvedMode]);
  return <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
    <StatusBar animated style={theme.dark ? "light" : "dark"} />
    {ready ? <Animated.View style={[styles.root, { opacity }]}><AppProvider><RootNavigator /></AppProvider></Animated.View> : null}
  </View>;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
