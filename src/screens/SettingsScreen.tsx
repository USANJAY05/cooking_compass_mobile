import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ChevronRight,
  Palette,
  UserRound,
  ShieldCheck,
  Gauge,
  Info,
} from 'lucide-react-native';

import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme';
import { appInfo } from '../config/appInfo';

type SettingsRow = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  route: string;
};

export const SettingsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const preferenceRows: SettingsRow[] = [
    {
      title: 'Appearance',
      subtitle: 'Theme, colors and display',
      icon: Palette,
      route: 'AppearanceSettings',
    },
    {
      title: 'Recipe creation',
      subtitle: 'Normal or recording mode for new recipes',
      icon: Gauge,
      route: 'RecipeCreationSettings',
    },
    {
      title: 'Interactive cooking',
      subtitle: 'Liberal or strict step guidance',
      icon: Gauge,
      route: 'InteractiveCookingSettings',
    },
  ];

  const accountRows: SettingsRow[] = [
    {
      title: 'Account information',
      subtitle: 'Name, username and email',
      icon: UserRound,
      route: 'AccountSettings',
    },
    {
      title: 'Security',
      subtitle: 'Sessions and sign-in controls',
      icon: ShieldCheck,
      route: 'SecuritySettings',
    },
    {
      title: 'About',
      subtitle: `${appInfo.appName} · v${appInfo.version}`,
      icon: Info,
      route: 'About',
    },
  ];

  const displayName =
    user?.name ||
    user?.username ||
    'Cooking enthusiast';

  const username = user?.username
    ? `@${user.username}`
    : '';

  const avatarUri =
    (user as any)?.picture ||
    (user as any)?.avatar_url ||
    null;

  const initials =
    displayName.trim().charAt(0).toUpperCase() || 'U';

  const renderGroup = (
    title: string,
    rows: SettingsRow[],
  ) => (
    <View style={styles.group}>
      <Text
        style={[
          styles.groupTitle,
          {
            color: theme.colors.textMuted,
          },
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.groupCard,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {rows.map((row, index) => {
          const Icon = row.icon;

          return (
            <React.Fragment key={row.route}>
              <TouchableOpacity
                activeOpacity={0.72}
                onPress={() =>
                  navigation.navigate(row.route)
                }
                style={styles.row}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        theme.colors.primary + '12',
                    },
                  ]}
                >
                  <Icon
                    size={20}
                    color={theme.colors.primary}
                    strokeWidth={2.1}
                  />
                </View>

                <View style={styles.rowText}>
                  <Text
                    style={[
                      styles.rowTitle,
                      {
                        color: theme.colors.text,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {row.title}
                  </Text>

                  <Text
                    style={[
                      styles.rowSubtitle,
                      {
                        color: theme.colors.textMuted,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {row.subtitle}
                  </Text>
                </View>

                <View
                  style={[
                    styles.chevronBox,
                    {
                      backgroundColor:
                        theme.colors.surfaceSecondary,
                    },
                  ]}
                >
                  <ChevronRight
                    size={16}
                    color={theme.colors.textMuted}
                    strokeWidth={2.2}
                  />
                </View>
              </TouchableOpacity>

              {index < rows.length - 1 ? (
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor:
                        theme.colors.divider,
                    },
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          theme.colors.background
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                theme.colors.surface,
            },
          ]}
        >
          <View
            style={[
              styles.profilePhotoRing,
              {
                backgroundColor:
                  theme.colors.primary + '14',
                borderColor:
                  theme.colors.primary + '30',
              },
            ]}
          >
            {avatarUri ? (
              <Image
                source={{
                  uri: avatarUri,
                }}
                style={styles.profilePhoto}
              />
            ) : (
              <View
                style={[
                  styles.initialAvatar,
                  {
                    backgroundColor:
                      theme.colors.primary,
                  },
                ]}
              >
                <Text style={styles.initials}>
                  {initials}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.profileName,
              {
                color: theme.colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          {username ? (
            <Text
              style={[
                styles.profileUsername,
                {
                  color:
                    theme.colors.textMuted,
                },
              ]}
              numberOfLines={1}
            >
              {username}
            </Text>
          ) : null}
        </View>

        {renderGroup(
          'PREFERENCES',
          preferenceRows,
        )}

        {renderGroup(
          'ACCOUNT',
          accountRows,
        )}

        <Text
          style={[
            styles.footer,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {appInfo.brandName.toUpperCase()} ·{' '}
          {appInfo.division.toUpperCase()}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 42,
  },
  profileCard: {
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 26,
  },
  profilePhotoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  profilePhoto: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  initialAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    maxWidth: '90%',
  },
  profileUsername: {
    fontSize: 13,
    marginTop: 4,
    maxWidth: '90%',
  },
  group: {
    marginBottom: 22,
  },
  groupTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1.25,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    borderRadius: 19,
    overflow: 'hidden',
  },
  row: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  rowSubtitle: {
    fontSize: 12.2,
    lineHeight: 17,
  },
  chevronBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 69,
  },
  footer: {
    textAlign: 'center',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginTop: 2,
  },
});