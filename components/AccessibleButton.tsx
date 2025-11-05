import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, Vibration, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';


interface AccessibleButtonProps {
  label: string;
  hint?: string;
  onPress: () => void;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
  testID?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  label,
  hint,
  onPress,
  children,
  variant = 'primary',
  size = 'large',
  disabled = false,
  testID,
}) => {
  const handlePress = () => {
    Vibration.vibrate(10);
    onPress();
  };

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
      style={[
        styles.button,
        styles[`button_${variant}` as keyof typeof styles],
        styles[`button_${size}` as keyof typeof styles],
        disabled && styles.button_disabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children || (
        <Text style={[
          styles.buttonText,
          styles[`buttonText_${variant}` as keyof typeof styles],
          styles[`buttonText_${size}` as keyof typeof styles],
        ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    minHeight: spacing.recommendedTouchTarget,
    minWidth: spacing.recommendedTouchTarget,
    // Manga-style bold borders
    borderWidth: 2.5,
    // Manga-style hard shadow (no blur)
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  } as ViewStyle,
  
  button_primary: {
    backgroundColor: colors.light.primary,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  } as ViewStyle,
  button_secondary: {
    backgroundColor: colors.light.surface,
    borderColor: 'rgba(0, 0, 0, 0.25)',
  } as ViewStyle,
  button_outline: {
    backgroundColor: 'transparent',
    borderColor: colors.light.primary,
    borderWidth: 2.5,
  } as ViewStyle,
  
  button_large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  } as ViewStyle,
  button_medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  } as ViewStyle,
  button_small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  } as ViewStyle,
  
  button_disabled: {
    opacity: 0.5,
  } as ViewStyle,
  
  buttonText: {
    fontWeight: typography.weights.bold, // Changed to bold for manga emphasis
    textAlign: 'center',
    textTransform: 'uppercase', // Manga style: ALL CAPS
    letterSpacing: 1, // Slightly spaced for impact
    // Text shadow for depth
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  } as TextStyle,
  buttonText_primary: {
    color: '#FFFFFF',
    fontSize: typography.sizes.lg,
  } as TextStyle,
  buttonText_secondary: {
    color: colors.light.text,
    fontSize: typography.sizes.lg,
  } as TextStyle,
  buttonText_outline: {
    color: colors.light.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  } as TextStyle,
  buttonText_large: {
    fontSize: typography.sizes.xl,
  } as TextStyle,
  buttonText_medium: {
    fontSize: typography.sizes.lg,
  } as TextStyle,
  buttonText_small: {
    fontSize: typography.sizes.base,
  } as TextStyle,
});