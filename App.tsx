import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './navigation/AppNavigator';
import { ThemeProvider } from './context/ThemeContext';
import { FocusProvider } from './context/FocusContext';

export default function App() {
  return (
    <ThemeProvider>
      <FocusProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </FocusProvider>
    </ThemeProvider>
  );
}
