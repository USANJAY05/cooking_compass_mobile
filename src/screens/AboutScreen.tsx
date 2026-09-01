import React from 'react';
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ExternalLink,
  Heart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';

import { useTheme } from '../theme';
import { appInfo } from '../config/appInfo';

export const AboutScreen = ({ navigation }: any) => {
  const { theme } = useTheme();

  const openGitHub = async () => {
    try {
      await Linking.openURL(appInfo.githubUrl);
    } catch (error) {
      console.warn('Could not open GitHub URL:', error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* BRAND CARD */}

        <View
          style={[
            styles.brandCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.brandIcon,
              {
                backgroundColor: theme.colors.primary + '15',
              },
            ]}
          >
            <Sparkles
              size={28}
              color={theme.colors.primary}
              strokeWidth={2}
            />
          </View>

          <Text
            style={[
              styles.brandName,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {appInfo.appName}
          </Text>

          <View style={styles.brandTagRow}>
            <View
              style={[
                styles.greenDot,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />

            <Text
              style={[
                styles.brandParent,
                {
                  color: theme.colors.textMuted,
                },
              ]}
            >
              {appInfo.brandName}
            </Text>

            <Text
              style={[
                styles.brandSeparator,
                {
                  color: theme.colors.border,
                },
              ]}
            >
              /
            </Text>

            <Text
              style={[
                styles.brandDivision,
                {
                  color: theme.colors.primary,
                },
              ]}
            >
              {appInfo.division}
            </Text>
          </View>

          <Text
            style={[
              styles.description,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            {appInfo.description}
          </Text>

          <Text
            style={[
              styles.tagline,
              {
                color: theme.colors.textMuted,
              },
            ]}
          >
            {appInfo.tagline}
          </Text>
        </View>

        {/* APP INFORMATION */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          APP INFORMATION
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <InfoRow
            label="Version"
            value={appInfo.version}
            theme={theme}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: theme.colors.divider,
              },
            ]}
          />

          <InfoRow
            label="Brand"
            value={appInfo.brandName}
            theme={theme}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: theme.colors.divider,
              },
            ]}
          />

          <InfoRow
            label="Division"
            value={appInfo.division}
            theme={theme}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: theme.colors.divider,
              },
            ]}
          />

          <InfoRow
            label="Created by"
            value={appInfo.creator}
            theme={theme}
          />
        </View>

        {/* RESOURCES */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          RESOURCES
        </Text>

        <View
          style={[
            styles.resourceCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* GITHUB */}

          <ResourceRow
            icon={
              <ExternalLink
                size={20}
                color={theme.colors.primary}
                strokeWidth={2}
              />
            }
            title="GitHub Repository"
            subtitle="View the source code"
            onPress={openGitHub}
            theme={theme}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: theme.colors.divider,
              },
            ]}
          />

          {/* PRIVACY POLICY */}

          <ResourceRow
            icon={
              <ShieldCheck
                size={20}
                color={theme.colors.primary}
                strokeWidth={2}
              />
            }
            title="Privacy Policy"
            subtitle="How your data is handled"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            theme={theme}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: theme.colors.divider,
              },
            ]}
          />

          {/* TERMS */}

          <ResourceRow
            icon={
              <Heart
                size={20}
                color={theme.colors.primary}
                strokeWidth={2}
              />
            }
            title="Terms of Service"
            subtitle="Terms and conditions"
            onPress={() => navigation.navigate('Terms')}
            theme={theme}
          />
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerBrand,
              {
                color: theme.colors.textMuted,
              },
            ]}
          >
            {appInfo.brandName.toUpperCase()}
          </Text>

          <Text
            style={[
              styles.footerDivision,
              {
                color: theme.colors.primary,
              },
            ]}
          >
            {appInfo.division.toUpperCase()}
          </Text>

          <Text
            style={[
              styles.footerTagline,
              {
                color: theme.colors.textMuted,
              },
            ]}
          >
            {appInfo.tagline}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const InfoRow = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) => {
  return (
    <View style={styles.infoRow}>
      <Text
        style={[
          styles.infoLabel,
          {
            color: theme.colors.textMuted,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,
          {
            color: theme.colors.text,
          },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
};

const ResourceRow = ({
  icon,
  title,
  subtitle,
  onPress,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: any;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.resourceRow}
    >
      <View
        style={[
          styles.resourceIcon,
          {
            backgroundColor: theme.colors.primary + '12',
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.resourceText}>
        <Text
          style={[
            styles.resourceTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.resourceSubtitle,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.resourceArrow,
          {
            backgroundColor: theme.colors.surfaceSecondary,
          },
        ]}
      >
        <ExternalLink
          size={15}
          color={theme.colors.textMuted}
          strokeWidth={2}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 45,
  },

  brandCard: {
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 28,
  },

  brandIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  brandName: {
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  brandTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  brandParent: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  brandSeparator: {
    fontSize: 11,
    marginHorizontal: 8,
  },

  brandDivision: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.7,
  },

  description: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
    maxWidth: 330,
  },

  tagline: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 12,
  },

  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1.25,
    marginBottom: 8,
    marginLeft: 4,
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
  },

  divider: {
    height: 1,
  },

  resourceCard: {
    borderWidth: 1,
    borderRadius: 19,
    overflow: 'hidden',
    marginBottom: 30,
  },

  resourceRow: {
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  resourceIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  resourceText: {
    flex: 1,
    minWidth: 0,
  },

  resourceTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },

  resourceSubtitle: {
    fontSize: 11.5,
  },

  resourceArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerBrand: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
  },

  footerDivision: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginTop: 3,
  },

  footerTagline: {
    fontSize: 9,
    marginTop: 10,
    textAlign: 'center',
  },
});
