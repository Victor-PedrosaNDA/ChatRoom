import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { initials } from '@/utils/avatar';

interface AvatarProps {
  username: string;
  color: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ username, color, size = 36, style }: AvatarProps) {
  const fontSize = size * 0.38;
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>{initials(username)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '700' },
});
