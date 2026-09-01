import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../theme';

export const TermsScreen = () => {
  const { theme } = useTheme();

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
        <Text
          style={[
            styles.intro,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          By using this application, you agree to these Terms of Service.
          Please read them carefully before using the app.
        </Text>

        <Section
          title="1. Using the App"
          theme={theme}
        >
          You may use the app for its intended personal and lawful
          purposes. You agree not to misuse the application or attempt
          to interfere with its operation.
        </Section>

        <Section
          title="2. Your Account"
          theme={theme}
        >
          You are responsible for maintaining the security of your account
          and for the activity associated with it. Please provide accurate
          information when creating or maintaining your account.
        </Section>

        <Section
          title="3. Your Content"
          theme={theme}
        >
          You retain ownership of content you create and save in the app,
          including recipes and routines. You are responsible for ensuring
          that content you submit does not violate applicable laws or the
          rights of others.
        </Section>

        <Section
          title="4. Acceptable Use"
          theme={theme}
        >
          You must not use the app to distribute harmful, unlawful,
          fraudulent, abusive, or otherwise inappropriate content. You
          must not attempt to gain unauthorized access to the app or its
          systems.
        </Section>

        <Section
          title="5. Availability"
          theme={theme}
        >
          We may update, modify, suspend, or discontinue parts of the app
          from time to time. We do not guarantee that every feature will
          always be available or error-free.
        </Section>

        <Section
          title="6. Third-Party Services"
          theme={theme}
        >
          Some app functionality may depend on third-party services.
          Availability and use of those services may be subject to their
          own terms and policies.
        </Section>

        <Section
          title="7. Disclaimer"
          theme={theme}
        >
          The app is provided for general informational and organizational
          purposes. Information provided through the app should not be
          treated as professional medical, nutritional, legal, or other
          professional advice.
        </Section>

        <Section
          title="8. Changes to These Terms"
          theme={theme}
        >
          These Terms may be updated as the application changes. Continued
          use of the app after updated terms are made available constitutes
          acceptance of the updated terms.
        </Section>

        <Section
          title="9. Contact"
          theme={theme}
        >
          If you have questions about these Terms of Service, please
          contact the app team through the support channel provided with
          the application.
        </Section>

        <Text
          style={[
            styles.updated,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          Last updated: August 2026
        </Text>
      </ScrollView>
    </View>
  );
};

const Section = ({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: any;
}) => {
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.sectionText,
          {
            color: theme.colors.textSecondary,
          },
        ]}
      >
        {children}
      </Text>
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
    paddingBottom: 45,
  },

  intro: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },

  sectionText: {
    fontSize: 13.5,
    lineHeight: 21,
  },

  updated: {
    fontSize: 11,
    marginTop: 5,
  },
});
