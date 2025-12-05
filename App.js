// Assignment 2 - Currency Converter - Mackenzie Bishop

import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// TODO: Put your real FreeCurrencyAPI key here
// Sign up at https://freecurrencyapi.com, create an API key, and paste it below.
const FREE_CURRENCY_API_KEY = "fca_live_5zeTShmo9xDPRSWuzevEJjAIII2Bd4apQyuQR1y0";

// ---------- Reusable labeled input component ----------
const LabeledInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
    />
  </View>
);

// Main screen: handles currency conversion logic
const MainScreen = ({ navigation }) => {
  const [baseCurrency, setBaseCurrency] = useState("CAD");
  const [targetCurrency, setTargetCurrency] = useState("");
  const [amount, setAmount] = useState("1");

  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    const currencyRegex = /^[A-Z]{3}$/;

    if (!currencyRegex.test(baseCurrency.trim())) {
      return "Base currency must be a 3-letter UPPERCASE ISO code (e.g., CAD).";
    }

    if (!currencyRegex.test(targetCurrency.trim())) {
      return "Destination currency must be a 3-letter UPPERCASE ISO code (e.g., USD).";
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return "Amount must be a positive, non-zero number.";
    }

    return null; // no error
  };

  const handleConvert = async () => {
    setErrorMessage("");
    setExchangeRate(null);
    setConvertedAmount(null);

    const validationError = validateInput();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const numericAmount = parseFloat(amount);
    const base = baseCurrency.trim().toUpperCase();
    const target = targetCurrency.trim().toUpperCase();

    setLoading(true);
    // Attempt API call and handle possible network or API errors
    try {
      const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${FREE_CURRENCY_API_KEY}&base_currency=${base}&currencies=${target}`;

      // Build API request URL for FreeCurrencyAPI (latest rates)
      const response = await fetch(url);

      if (!response.ok) {
        setErrorMessage(
          `Network error: ${response.status} ${response.statusText}`
        );
        setLoading(false);
        return;
      }

      const json = await response.json();

      if (!json || !json.data) {
        setErrorMessage("Unexpected API response format.");
        setLoading(false);
        return;
      }

      const rate = json.data[target];

      if (rate === undefined || rate === null) {
        setErrorMessage(
          "Could not find exchange rate for the given currency pair."
        );
        setLoading(false);
        return;
      }

      const result = numericAmount * rate;

      setExchangeRate(rate);
      setConvertedAmount(result);
    } catch (error) {
      setErrorMessage(
        "Failed to fetch exchange rate. Please check your network connection or API key."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Currency Converter</Text>
        <Text style={styles.subtitle}>
          Enter a base currency, destination currency, and amount.
        </Text>

        // Reusable component for input fields
        <LabeledInput
          label="Base Currency (e.g., CAD)"
          value={baseCurrency}
          onChangeText={(text) => setBaseCurrency(text.toUpperCase())}
          placeholder="CAD"
          autoCapitalize="characters"
        />

        <LabeledInput
          label="Destination Currency (e.g., USD)"
          value={targetCurrency}
          onChangeText={(text) => setTargetCurrency(text.toUpperCase())}
          placeholder="USD"
          autoCapitalize="characters"
        />

        <LabeledInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="1"
          keyboardType="numeric"
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : undefined]}
          onPress={handleConvert}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Converting..." : "Convert"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Fetching latest rates...</Text>
          </View>
        )}

        {exchangeRate !== null && convertedAmount !== null && !loading && (
          <View className="result-container" style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Result:</Text>
            <Text style={styles.resultText}>
              {amount} {baseCurrency.toUpperCase()} ={" "}
              {convertedAmount.toFixed(4)} {targetCurrency.toUpperCase()}
            </Text>

            <Text style={styles.rateText}>
              Exchange rate used: 1 {baseCurrency.toUpperCase()} ={" "}
              {exchangeRate} {targetCurrency.toUpperCase()}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("About")}
        >
          <Text style={styles.secondaryButtonText}>Go to About</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// About screen: shows name, student ID, and app purpose

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>About This App</Text>

        <Text style={styles.aboutText}>
          Name: <Text style={styles.bold}>Mackenzie Bishop</Text>
        </Text>
        <Text style={styles.aboutText}>
          Student ID: <Text style={styles.bold}>YOUR_STUDENT_ID</Text>
        </Text>

        <View style={styles.aboutBox}>
          <Text style={styles.aboutHeading}>What this application does</Text>
          <Text style={styles.aboutDescription}>
            This Android React Native application converts an amount from a base
            currency into a desired currency. It uses the FreeCurrencyAPI
            service to fetch the latest exchange rates, validates user input,
            and displays clear error messages when something goes wrong
            (like network issues or invalid currency codes).
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ---------- Navigation setup ----------
const Stack = createNativeStackNavigator();
// Root component that sets up stack navigation between Main and About screens
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: "Currency Converter" }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: "About" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

// ---------- Styles ----------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 11,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0066cc",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#0066cc",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginTop: 4,
    marginBottom: 4,
  },
  loadingContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 19,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#e8f4ff",
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 4,
  },
  rateText: {
    fontSize: 14,
    color: "#333",
  },
  aboutText: {
    fontSize: 16,
    marginTop: 8,
  },
  bold: {
    fontWeight: "700",
  },
  aboutBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  aboutHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  aboutDescription: {
    fontSize: 14,
    color: "#333",
  },
});
