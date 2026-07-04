import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export function ReputationStars({
  reputation,
  reviewsCount,
}: {
  reputation: number;
  reviewsCount?: number;
}) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="tint">
        ★ {reputation.toFixed(1)}
      </ThemedText>
      {reviewsCount != null && (
        <ThemedText type="small" themeColor="textSecondary">
          ({reviewsCount})
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
