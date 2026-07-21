import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, useTheme } from "../theme";

export function BuilderLivePreview({
  visible,
  url,
  onClose,
  title = "Preview",
}: {
  visible: boolean;
  url: string;
  onClose: () => void;
  title?: string;
}) {
  const { theme } = useTheme();
  if (!visible) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.navigation, borderBottomColor: theme.colors.divider }]}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="close-outline" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 44 }} />
        </View>
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          allowsBackForwardNavigationGestures
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
});
