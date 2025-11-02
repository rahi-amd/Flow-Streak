import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors, typography } from '../theme';

type TextVariant = 'heading' | 'title' | 'body' | 'caption';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextColor = 'text' | 'textSecondary' | 'primary';
type TextAlign = 'left' | 'center' | 'right';

interface AccessibleTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  style?: TextStyle;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  variant = 'body',
  weight = 'regular',
  color = 'text',
  align = 'left',
  style,
}) => {
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'heading':
        return {
          fontSize: typography.sizes.xxxl,
          fontWeight: typography.weights.bold,
          fontFamily: typography.fonts.heading, // Manga font!
        };
      case 'title':
        return {
          fontSize: typography.sizes.xxl,
          fontWeight: typography.weights.bold,
          fontFamily: typography.fonts.heading, // Manga font!
        };
      case 'body':
        return {
          fontSize: typography.sizes.md,
          fontWeight: typography.weights.regular,
          fontFamily: typography.fonts.body, // System font for readability
        };
      case 'caption':
        return {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.regular,
          fontFamily: typography.fonts.body,
        };
    }
  };

  const getColorStyle = (): TextStyle => {
    switch (color) {
      case 'text':
        return { color: colors.light.text };
      case 'textSecondary':
        return { color: colors.light.textSecondary };
      case 'primary':
        return { color: colors.light.primary };
    }
  };

  const getAlignStyle = (): TextStyle => {
    return { textAlign: align };
  };

  const getWeightStyle = (): TextStyle => {
    // Only apply fontWeight for body text (not headings with custom font)
    if (variant === 'body' || variant === 'caption') {
      return { fontWeight: typography.weights[weight] };
    }
    return {};
  };

  return (
    <Text
      style={[
        styles.base,
        getVariantStyle(),
        getColorStyle(),
        getAlignStyle(),
        getWeightStyle(),
        style,
      ]}
      accessibilityRole="text"
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: colors.light.text,
  },
});