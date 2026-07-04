import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AvatarInitials } from '@/presentation/components/avatar-initials';

export function HomeHeader({
  username,
  newMatchesCount,
}: {
  username: string;
  newMatchesCount: number;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.greeting}>
        <AvatarInitials username={username} />
        <View>
          <ThemedText type="small" themeColor="textSecondary">
            Bem-vindo de volta
          </ThemedText>
          <ThemedText type="smallBold">@{username}</ThemedText>
        </View>
      </View>
      <View style={[styles.bell, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText>🔔</ThemedText>
        {newMatchesCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.tint }]}>
            <ThemedText type="smallBold" style={[styles.badgeText, { color: theme.onTint }]}>
              {newMatchesCount}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
