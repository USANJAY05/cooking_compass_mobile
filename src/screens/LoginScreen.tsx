import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';

import {
  ArrowUpRight,
  Leaf,
  Utensils,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';

import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme';
import { brand } from '../config/brand';

export const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const { height, width } = useWindowDimensions();

  // =========================================================
  // ANIMATIONS
  // =========================================================

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenY = useRef(new Animated.Value(25)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandScale = useRef(new Animated.Value(0.9)).current;

  const visualOpacity = useRef(new Animated.Value(0)).current;
  const visualScale = useRef(new Animated.Value(0.82)).current;

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY = useRef(new Animated.Value(25)).current;

  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const featuresY = useRef(new Animated.Value(15)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const arrowX = useRef(new Animated.Value(0)).current;

  const orbScale = useRef(new Animated.Value(0.95)).current;
  const orbX = useRef(new Animated.Value(0)).current;
  const orbY = useRef(new Animated.Value(0)).current;

  const ringRotation = useRef(new Animated.Value(0)).current;

  // =========================================================
  // THEME
  // =========================================================

  const colors = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    surfaceSecondary: theme.colors.surfaceSecondary,
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    textMuted: theme.colors.textMuted,
    border: theme.colors.border,

    navy: theme.colors.brandNavy,
    green: theme.colors.primary,
    greenDark: theme.colors.primaryDark,
    greenLight: theme.colors.greenLight,
    white: theme.colors.white,
  };

  // =========================================================
  // RESPONSIVE
  // =========================================================

  const isSmall = height < 650;
  const isCompact = height < 730;
  const isWide = width >= 600;

  const visualSize = isSmall
    ? 190
    : isCompact
      ? 220
      : isWide
        ? 270
        : 245;

  const logoCircleSize = visualSize * 0.68;

  // =========================================================
  // INTRO ANIMATION
  // =========================================================

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(screenY, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.spring(brandScale, {
          toValue: 1,
          friction: 7,
          tension: 75,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(visualOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.spring(visualScale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(heroY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(featuresOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(featuresY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(buttonY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ---------------------------------------------------------
    // ROTATING RING
    // ---------------------------------------------------------

    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // ---------------------------------------------------------
    // BACKGROUND ORB
    // ---------------------------------------------------------

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(orbScale, {
            toValue: 1.08,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(orbScale, {
            toValue: 0.95,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(orbX, {
            toValue: 18,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(orbX, {
            toValue: -10,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(orbY, {
            toValue: -14,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(orbY, {
            toValue: 12,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLoginPress = () => {
    if (isLoading) return;

    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.965,
        friction: 7,
        tension: 140,
        useNativeDriver: true,
      }),

      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 6,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(arrowX, {
        toValue: 6,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.spring(arrowX, {
        toValue: 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    login();
  };

  // =========================================================
  // ROTATION
  // =========================================================

  const rotation = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.backgroundOrb,
          {
            backgroundColor: colors.greenLight,
            transform: [
              { translateX: orbX },
              { translateY: orbY },
              { scale: orbScale },
            ],
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.backgroundOrbBottom,
          {
            backgroundColor: colors.green,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.backgroundGlow,
          {
            backgroundColor: colors.green,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.topAccent,
          {
            backgroundColor: colors.green,
          },
        ]}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <Animated.View
        style={[
          styles.content,
          isCompact && styles.contentCompact,
          isSmall && styles.contentSmall,
          isWide && styles.contentWide,
          {
            opacity: screenOpacity,
            transform: [{ translateY: screenY }],
          },
        ]}
      >
        {/* ===================================================
            BRAND
        =================================================== */}

        <Animated.View
          style={[
            styles.brand,
            {
              opacity: brandOpacity,
              transform: [{ scale: brandScale }],
            },
          ]}
        >
          <View
            style={[
              styles.brandPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.brandDot,
                {
                  backgroundColor: colors.green,
                },
              ]}
            />

            <Text
              style={[
                styles.brandParent,
                {
                  color: colors.text,
                },
              ]}
            >
              MUVETH
            </Text>

            <Text
              style={[
                styles.brandDivider,
                {
                  color: colors.border,
                },
              ]}
            >
              /
            </Text>

            <Text
              style={[
                styles.brandHealth,
                {
                  color: colors.greenDark,
                },
              ]}
            >
              HEALTH
            </Text>
          </View>
        </Animated.View>

        {/* ===================================================
            LOGO / VISUAL
        =================================================== */}

        <Animated.View
          style={[
            styles.visualArea,
            {
              width: visualSize,
              height: visualSize,
              opacity: visualOpacity,
              transform: [{ scale: visualScale }],
            },
          ]}
        >
          {/* Soft halo */}

          <View
            style={[
              styles.halo,
              {
                width: visualSize * 0.88,
                height: visualSize * 0.88,
                borderRadius: visualSize * 0.44,
                backgroundColor: colors.greenLight,
              },
            ]}
          />

          {/* Rotating ring */}

          <Animated.View
            style={[
              styles.outerRing,
              {
                width: visualSize * 0.92,
                height: visualSize * 0.92,
                borderRadius: visualSize * 0.46,
                borderColor: `${colors.green}28`,
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            <View
              style={[
                styles.ringDotLarge,
                {
                  backgroundColor: colors.green,
                },
              ]}
            />

            <View
              style={[
                styles.ringDotSmall,
                {
                  backgroundColor: colors.navy,
                },
              ]}
            />

            <View
              style={[
                styles.ringDotTiny,
                {
                  backgroundColor: colors.green,
                },
              ]}
            />
          </Animated.View>

          {/* Logo shadow */}

          <View
            style={[
              styles.logoCardShadow,
              {
                width: logoCircleSize + 8,
                height: logoCircleSize + 8,
                borderRadius: (logoCircleSize + 8) / 2,
              },
            ]}
          />

          {/* Logo circle */}

          <View
            style={[
              styles.logoCircle,
              {
                width: logoCircleSize,
                height: logoCircleSize,
                borderRadius: logoCircleSize / 2,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Very subtle inner border */}

            <View
              style={[
                styles.logoInnerRing,
                {
                  borderColor: `${colors.green}18`,
                  borderRadius: logoCircleSize / 2,
                },
              ]}
            />

            {/* =================================================
                LOGO IMAGE

                Larger size = less empty space around logo.
                ================================================= */}

            <Image
              source={require('../../assets/icon.png')}
              style={[
                styles.logo,
                {
                  width: logoCircleSize,
                  height: logoCircleSize,
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Top floating leaf */}

          <FloatingIcon
            icon={Leaf}
            size={visualSize}
            position="top"
            background={colors.surface}
            border={colors.border}
            iconColor={colors.green}
          />

          {/* Bottom floating heart */}

          <FloatingIcon
            icon={HeartPulse}
            size={visualSize}
            position="bottom"
            background={colors.surface}
            border={colors.border}
            iconColor={colors.greenDark}
          />

          {/* Spark */}

          <View
            style={[
              styles.sparkIcon,
              {
                backgroundColor: colors.green,
              },
            ]}
          >
            <Sparkles
              size={12}
              color={colors.white}
              strokeWidth={2.2}
            />
          </View>
        </Animated.View>

        {/* ===================================================
            HERO
        =================================================== */}

        <Animated.View
          style={[
            styles.hero,
            isSmall && styles.heroSmall,
            {
              opacity: heroOpacity,
              transform: [{ translateY: heroY }],
            },
          ]}
        >
          <View
            style={[
              styles.eyebrowRow,
              {
                backgroundColor: `${colors.green}0D`,
              },
            ]}
          >
            <Sparkles
              size={12}
              color={colors.green}
              strokeWidth={2.2}
            />

            <Text
              style={[
                styles.eyebrow,
                {
                  color: colors.greenDark,
                },
              ]}
            >
              YOUR KITCHEN, REIMAGINED
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Eat well.
          </Text>

          <Text
            style={[
              styles.titleAccent,
              {
                color: colors.navy,
              },
            ]}
          >
            Live better.
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Create beautiful meals, understand what you eat,
            and make every recipe work for you.
          </Text>
        </Animated.View>

        {/* ===================================================
            FEATURES
        =================================================== */}

        <Animated.View
          style={[
            styles.featuresCard,
            {
              opacity: featuresOpacity,
              transform: [{ translateY: featuresY }],
              backgroundColor: `${colors.surface}E8`,
              borderColor: colors.border,
            },
          ]}
        >
          <MiniFeature
            icon={Utensils}
            label="Recipes"
            colors={colors}
          />

          <FeatureDivider color={colors.border} />

          <MiniFeature
            icon={Leaf}
            label="Ingredients"
            colors={colors}
          />

          <FeatureDivider color={colors.border} />

          <MiniFeature
            icon={HeartPulse}
            label="Nutrition"
            colors={colors}
          />
        </Animated.View>

        {/* ===================================================
            CTA
        =================================================== */}

        <Animated.View
          style={[
            styles.ctaWrapper,
            {
              opacity: buttonOpacity,
              transform: [
                { translateY: buttonY },
                { scale: buttonScale },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.92}
            disabled={isLoading}
            onPress={handleLoginPress}
            style={[
              styles.loginButton,
              {
                backgroundColor: colors.navy,
              },
            ]}
          >
            {isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator
                  size="small"
                  color={colors.white}
                />

                <Text style={styles.loginText}>
                  Opening your kitchen…
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.buttonContent}>
                  <Text style={styles.loginText}>
                    Continue with MUVETH
                  </Text>

                  <View style={styles.secureLine}>
                    <ShieldCheck
                      size={12}
                      color="rgba(255,255,255,0.62)"
                      strokeWidth={2.2}
                    />

                    <Text style={styles.loginSubtext}>
                      Secure sign in
                    </Text>
                  </View>
                </View>

                <Animated.View
                  style={[
                    styles.arrowButton,
                    {
                      backgroundColor: colors.green,
                      transform: [{ translateX: arrowX }],
                    },
                  ]}
                >
                  <ArrowUpRight
                    size={21}
                    color={colors.white}
                    strokeWidth={2.4}
                  />
                </Animated.View>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <View style={styles.footerRow}>
          <ShieldCheck
            size={12}
            color={colors.greenDark}
            strokeWidth={2.2}
          />

          <Text
            style={[
              styles.footerText,
              {
                color: colors.textMuted,
              },
            ]}
          >
            Secure authentication
          </Text>

          <View
            style={[
              styles.footerDot,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <Text
            style={[
              styles.footerText,
              {
                color: colors.textMuted,
              },
            ]}
          >
            {brand.parentTagline}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ===========================================================
// FLOATING ICON
// ===========================================================

type FloatingIconProps = {
  icon: React.ComponentType<any>;
  size: number;
  position: 'top' | 'bottom';
  background: string;
  border: string;
  iconColor: string;
};

const FloatingIcon = ({
  icon: Icon,
  size,
  position,
  background,
  border,
  iconColor,
}: FloatingIconProps) => {
  return (
    <View
      style={[
        styles.floatingIcon,

        position === 'top'
          ? {
              top: size * 0.10,
              right: size * 0.01,
            }
          : {
              bottom: size * 0.09,
              left: size * 0.01,
            },

        {
          backgroundColor: background,
          borderColor: border,
        },
      ]}
    >
      <Icon
        size={18}
        color={iconColor}
        strokeWidth={2.1}
      />
    </View>
  );
};

// ===========================================================
// MINI FEATURE
// ===========================================================

type MiniFeatureProps = {
  icon: React.ComponentType<any>;
  label: string;
  colors: {
    green: string;
    textMuted: string;
  };
};

const MiniFeature = ({
  icon: Icon,
  label,
  colors,
}: MiniFeatureProps) => {
  return (
    <View style={styles.miniFeature}>
      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor: `${colors.green}12`,
          },
        ]}
      >
        <Icon
          size={14}
          color={colors.green}
          strokeWidth={2.1}
        />
      </View>

      <Text
        style={[
          styles.miniFeatureText,
          {
            color: colors.textMuted,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ===========================================================
// FEATURE DIVIDER
// ===========================================================

const FeatureDivider = ({
  color,
}: {
  color: string;
}) => {
  return (
    <View
      style={[
        styles.featureDivider,
        {
          backgroundColor: color,
        },
      ]}
    />
  );
};

// ===========================================================
// STYLES
// ===========================================================

const styles = StyleSheet.create({
  // =========================================================
  // CONTAINER
  // =========================================================

  container: {
    flex: 1,
    overflow: 'hidden',
  },

  // =========================================================
  // BACKGROUND
  // =========================================================

  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  backgroundOrb: {
    position: 'absolute',
    width: 470,
    height: 470,
    borderRadius: 235,
    top: -335,
    right: -185,
    opacity: 0.22,
  },

  backgroundOrbBottom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    left: -230,
    bottom: -220,
    opacity: 0.025,
  },

  backgroundGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -150,
    bottom: 40,
    opacity: 0.025,
  },

  // =========================================================
  // CONTENT
  // =========================================================

  content: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 26,
  },

  contentCompact: {
    paddingVertical: 18,
  },

  contentSmall: {
    paddingVertical: 10,
  },

  contentWide: {
    maxWidth: 600,
  },

  // =========================================================
  // BRAND
  // =========================================================

  brand: {
    alignItems: 'center',
    marginBottom: 4,
  },

  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },

  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },

  brandParent: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.4,
  },

  brandDivider: {
    fontSize: 11,
    marginHorizontal: 7,
  },

  brandHealth: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
  },

  // =========================================================
  // VISUAL
  // =========================================================

  visualArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 0,
  },

  halo: {
    position: 'absolute',
    opacity: 0.17,
  },

  outerRing: {
    position: 'absolute',
    borderWidth: 1,
  },

  ringDotLarge: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: 18,
    left: '30%',
  },

  ringDotSmall: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    right: 25,
    bottom: 40,
  },

  ringDotTiny: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    left: 28,
    bottom: 56,
  },

  logoCardShadow: {
    position: 'absolute',
    backgroundColor: '#172554',
    opacity: 0.08,
    transform: [
      {
        translateY: 10,
      },
    ],
  },

  logoCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,

    shadowColor: '#172554',
    shadowOffset: {
      width: 0,
      height: 12,
    },

    shadowOpacity: 0.12,
    shadowRadius: 28,

    elevation: 6,
  },

  logoInnerRing: {
    position: 'absolute',
    width: '88%',
    height: '88%',
    borderWidth: 1,
  },

  /*
   * IMPORTANT:
   *
   * The logo now fills the entire logo circle.
   * There is no padding added around the Image.
   */
  logo: {
    margin: 0,
    padding: 0,
  },

  floatingIcon: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,

    shadowColor: '#172554',
    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.09,
    shadowRadius: 12,

    elevation: 3,
  },

  sparkIcon: {
    position: 'absolute',
    width: 27,
    height: 27,
    borderRadius: 14,
    right: '12%',
    bottom: '17%',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#172554',
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.15,
    shadowRadius: 8,

    elevation: 3,
  },

  // =========================================================
  // HERO
  // =========================================================

  hero: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 15,
  },

  heroSmall: {
    marginBottom: 11,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 8,
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.8,
  },

  title: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1.7,
  },

  titleAccent: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1.7,
  },

  description: {
    maxWidth: 350,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },

  // =========================================================
  // FEATURES
  // =========================================================

  featuresCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 8,
    paddingVertical: 8,

    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,

    marginBottom: 17,

    shadowColor: '#172554',
    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.035,
    shadowRadius: 12,

    elevation: 1,
  },

  miniFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },

  featureIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  miniFeatureText: {
    fontSize: 9.5,
    fontWeight: '700',
  },

  featureDivider: {
    width: 1,
    height: 18,
    opacity: 0.8,
  },

  // =========================================================
  // CTA
  // =========================================================

  ctaWrapper: {
    width: '100%',
    maxWidth: 410,
  },

  loginButton: {
    width: '100%',
    minHeight: 70,
    borderRadius: 23,

    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 21,
    paddingRight: 11,

    shadowColor: '#172554',
    shadowOffset: {
      width: 0,
      height: 13,
    },

    shadowOpacity: 0.20,
    shadowRadius: 24,

    elevation: 9,
  },

  buttonContent: {
    flex: 1,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.15,
  },

  secureLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },

  loginSubtext: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 10,
    fontWeight: '600',
  },

  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  // =========================================================
  // FOOTER
  // =========================================================

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
  },

  footerText: {
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 0.15,
  },

  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 3,
  },
});
