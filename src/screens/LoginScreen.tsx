import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

// إعداد ظهور الـ Notification والـ App محلولة
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
});

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Logic الـ Notifications ---
  const registerForPushNotifications = async (userId: string) => {
    try {
      if (!Device.isDevice) return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId || "9524d5e4-df18-4234-88e3-22792d9bdf12";//
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

      await updateDoc(doc(db, 'users', userId), { 
        pushToken: token,
        lastLogin: new Date().toISOString() 
      });

    } catch (e) { 
      console.log("Notification Logic Error:", e); 
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("تنبيه", "عمر الإيميل وكلمة السر ساعة");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await registerForPushNotifications(userCredential.user.uid);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert("خطأ", "ثبت في الإيميل أو كلمة السر");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert("تنبيه", "اكتب الإيميل متاعك في الخانة الفوقانية ساعة.");
      return;
    }
    sendPasswordResetEmail(auth, email.trim())
      .then(() => { Alert.alert("تم الإرسال", "بعثنالك رابط على إيميلك."); })
      .catch(() => { Alert.alert("خطأ", "تأكد إنو الإيميل صحيح."); });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الدخول 🇹🇳</Text>
      
      <TextInput 
        placeholder="البريد الإلكتروني" 
        placeholderTextColor="#999" // رجعنا الـ Placeholder يبان
        style={styles.input} 
        onChangeText={setEmail} 
        value={email}
        autoCapitalize="none" 
        keyboardType="email-address"
        autoCorrect={false}
      />
      
      <View style={styles.passwordContainer}>
        <TextInput 
          placeholder="كلمة السر" 
          placeholderTextColor="#999" // رجعنا الـ Placeholder يبان
          style={styles.passwordInput} 
          onChangeText={setPassword} 
          value={password}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>دخول</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
        <Text style={styles.forgotText}>نسيت كلمة السر؟</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpLink}>ماعندكش حساب؟ سجل من هنا</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#000' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    color: '#000', // يضمن إن الكتيبة تطلع كحلة مش بيضاء
    backgroundColor: '#fdfdfd' 
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fdfdfd'
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#000', // يضمن إن النقاط تطلع كحلة
  },
  eyeIcon: { padding: 10 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  forgotContainer: { marginTop: 15, alignItems: 'center' },
  forgotText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },
  signUpLink: { marginTop: 25, color: '#007AFF', textAlign: 'center' }
});