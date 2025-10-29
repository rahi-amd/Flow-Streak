import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { ColorKey, colors, FontWeight, typography } from '../theme';

interface AccessibleTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'title' | 'heading' | 'body' | 'caption';
  color?: ColorKey;
  weight?: FontWeight;
  align?: 'left' | 'center' | 'right';
  accessibilityLabel?: string;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  variant = 'body',
  color = 'text',
  weight = 'regular',
  align = 'left',
  accessibilityLabel,
  style,
  ...props
}) => {
  return (
    <Text
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityRole="text"
      style={[
        styles.text,
        styles[`text_${variant}`],
        { color: colors.light[color] || colors.light.text },
        { fontWeight: typography.weights[weight] },
        { textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: colors.light.text,
  } as TextStyle,
  text_title: {
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.huge * typography.lineHeights.tight,
  } as TextStyle,
  text_heading: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.xxl * typography.lineHeights.normal,
  } as TextStyle,
  text_body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  } as TextStyle,
  text_caption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  } as TextStyle,
});
