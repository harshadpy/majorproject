import { useColorScheme } from 'react-native';
import { getThemeColors } from '@/constants/Colors';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getThemeColors(isDark);
  
  return {
    isDark,
    colors,
    colorScheme,
  };
}