import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { radius, useThemedStyles, type AppTheme } from "../theme";
import { AppButton, ErrorState, Field } from "../components/ui";
import { DEMO_LOGINS } from "../features/auth/demo-credentials";

type Mode = "login" | "register" | "forgot";

export function AuthScreen() {
  const styles = useThemedStyles(createStyles);
  const { signIn, register, forgotPassword } = useApp();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false); const [demoLoading, setDemoLoading] = useState<"user" | "admin" | null>(null); const [error, setError] = useState("");
  const authenticating = loading || demoLoading !== null;

  const submit = async () => {
    setError("");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (mode !== "forgot" && password.length < 8) return setError("Password must be at least 8 characters.");
    if (mode === "register" && name.trim().length < 2) return setError("Enter your full name.");
    setLoading(true);
    try {
      if (mode === "login") await signIn(email, password, { loginType: "user", rememberMe: false });
      else if (mode === "register") await register({ name: name.trim(), email, password, tenantName: storeName.trim() || undefined });
      else Alert.alert("Check your inbox", await forgotPassword(email));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn't complete that request."); }
    finally { setLoading(false); }
  };

  const loginAsDemo = async (kind: "user" | "admin") => {
    setError(""); setDemoLoading(kind);
    const credentials = DEMO_LOGINS[kind];
    try {
      await signIn(credentials.email, credentials.password, { loginType: credentials.loginType, rememberMe: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Quick login failed");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.brandRow}><Image source={require("../../assets/logo.png")} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="BornoLand" /></View>
        <View style={styles.hero}><View style={styles.eyebrow}><Text style={styles.eyebrowText}>STORE MANAGEMENT, ANYWHERE</Text></View><Text style={styles.title}>{mode === "login" ? "Welcome back" : mode === "register" ? "Start your store" : "Reset password"}</Text><Text style={styles.subtitle}>{mode === "login" ? "Manage products, orders and growth from one mobile workspace." : mode === "register" ? "Create your workspace and launch your first online store." : "We'll email you a secure link to choose a new password."}</Text></View>
        <View style={styles.form}>
          {mode === "register" ? <><Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" /><Field label="Store or workspace name (optional)" value={storeName} onChangeText={setStoreName} placeholder="Nayeem Store" /></> : null}
          <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          {mode !== "forgot" ? <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoComplete={mode === "login" ? "current-password" : "new-password"} /> : null}
          {error ? <ErrorState message={error} /> : null}
          <AppButton title={mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"} loading={loading} disabled={authenticating && !loading} onPress={submit} />
          {mode === "login" ? <Pressable disabled={authenticating} onPress={() => { setMode("forgot"); setError(""); }}><Text style={styles.link}>Forgot Password</Text></Pressable> : null}
          {mode === "login" ? <>
            <View style={styles.orRow}><View style={styles.line} /><Text style={styles.orText}>OR CONTINUE WITH</Text><View style={styles.line} /></View>
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>QUICK DEMO ACCESS</Text>
              <AppButton variant="secondary" title="Login as Demo User" icon={<Text style={styles.sparkle}>✦</Text>} loading={demoLoading === "user"} disabled={authenticating && demoLoading !== "user"} onPress={() => loginAsDemo("user")} />
              <AppButton variant="secondary" title="Login as Demo Admin" icon={<Text style={styles.sparkle}>✦</Text>} loading={demoLoading === "admin"} disabled={authenticating && demoLoading !== "admin"} onPress={() => loginAsDemo("admin")} />
            </View>
          </> : null}
        </View>
        <View style={styles.switchRow}><Text style={styles.switchText}>{mode === "login" ? "New to Bornoland?" : "Already have an account?"}</Text><Pressable disabled={authenticating} onPress={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}><Text style={[styles.switchLink, authenticating && { opacity: 0.45 }]}>{mode === "login" ? " Create Account" : " Sign in"}</Text></Pressable></View>
        <Text style={styles.legal}>By continuing, you agree to Bornoland's Terms and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function SplashScreen() {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.splash}><Image source={require("../../assets/logo.png")} style={styles.splashLogo} resizeMode="contain" accessibilityLabel="BornoLand" /><Text style={styles.splashText}>Your commerce, in motion.</Text></View>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background }, content: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 24, paddingTop: Platform.OS === "ios" ? 68 : 42, paddingBottom: 32 },
  brandRow: { flexDirection: "row", alignItems: "center" }, brandLogo: { width: 168, height: 72 },
  hero: { marginTop: 48, marginBottom: 28 }, eyebrow: { alignSelf: "flex-start", backgroundColor: theme.colors.primarySoft, paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, marginBottom: 15 }, eyebrowText: { color: theme.colors.primary, fontWeight: "800", fontSize: 10, letterSpacing: 0.7 }, title: { fontSize: 34, lineHeight: 40, fontWeight: "900", color: theme.colors.text, letterSpacing: -0.8 }, subtitle: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 22, marginTop: 9, maxWidth: 350 },
  form: { gap: 16 }, link: { textAlign: "center", color: theme.colors.primary, fontWeight: "700", fontSize: 13 }, orRow: { flexDirection: "row", alignItems: "center", gap: 12 }, line: { height: 1, flex: 1, backgroundColor: theme.colors.border }, orText: { color: theme.colors.textSoft, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 }, demoBox: { gap: 11, borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceRaised, padding: 15, borderRadius: radius.lg }, demoTitle: { color: theme.colors.textMuted, textAlign: "center", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, sparkle: { color: theme.colors.primary, fontSize: 16, fontWeight: "900" },
  switchRow: { marginTop: 26, flexDirection: "row", justifyContent: "center" }, switchText: { color: theme.colors.textMuted, fontSize: 13 }, switchLink: { color: theme.colors.primary, fontSize: 13, fontWeight: "800" }, legal: { color: theme.colors.textSoft, textAlign: "center", fontSize: 10, lineHeight: 15, marginTop: 22 },
  splash: { flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center", gap: 13 }, splashLogo: { width: 240, height: 240 }, splashText: { color: theme.colors.textMuted, fontSize: 13 },
});
