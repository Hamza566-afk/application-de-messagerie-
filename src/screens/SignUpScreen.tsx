import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanEmail || !password || !cleanUsername) {
      Alert.alert("خطأ", "بربي كمل عبي الخانات الكل");
      return;
    }

    if (password.length < 6) {
      Alert.alert("خطأ", "كلمة السر لازم تكون فيها 6 حروف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: cleanUsername,
        email: cleanEmail,
        photoURL: "", 
        friends: [],        
        friendRequests: [],
        createdAt: new Date().toISOString()
      });

      setLoading(false);
      // navigation.navigate('Home');
    } catch (error: any) {
      setLoading(false);
      let errorMessage = "صارت مشكلة، عاود جرب";
      if (error.code === 'auth/email-already-in-use') errorMessage = "الإيميل هذا مستعمل قبل";
      if (error.code === 'auth/invalid-email') errorMessage = "الإيميل موش صحيح";
      
      console.log("SignUp Error:", error.code);
      Alert.alert("خطأ في التسجيل", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>صنع حساب جديد 🇹🇳</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
          <TextInput 
            placeholder="اسم المستخدم" 
            placeholderTextColor="#999"
            style={styles.input} 
            onChangeText={setUsername} 
            value={username}
            autoCorrect={false}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
          <TextInput 
            placeholder="البريد الإلكتروني" 
            placeholderTextColor="#999"
            style={styles.input} 
            onChangeText={setEmail} 
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        <View style={styles.passwordContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
          <TextInput 
            placeholder="كلمة السر" 
            placeholderTextColor="#999"
            style={styles.passwordInput} 
            onChangeText={setPassword} 
            value={password}
            secureTextEntry={!showPassword} 
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color="#888" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleSignUp} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>إنشاء حساب</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 25 }} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>عندك حساب؟ <Text style={{ fontWeight: 'bold' }}>سجل الدخول</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1,
    justifyContent: 'center', 
    padding: 25, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 40, 
    color: '#000' 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 5,
  },
  input: { 
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 10,
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  linkText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 15
  }
});