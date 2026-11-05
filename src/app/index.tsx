import React, { useState } from 'react';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup'>('login');

  // Object navigation basit bch ykhdm el screens bel gda
  const navigationMock = {
    navigate: (screenName: string) => {
      if (screenName === 'SignUp' || screenName === 'signup') {
        setCurrentScreen('signup');
      } else if (screenName === 'Login' || screenName === 'login') {
        setCurrentScreen('login');
      }
    },
    goBack: () => setCurrentScreen('login'),
  };

  return (
    <>
      {currentScreen === 'login' ? (
        <LoginScreen navigation={navigationMock} />
      ) : (
        <SignUpScreen navigation={navigationMock} />
      )}
    </>
  );
}