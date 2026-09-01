import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../theme';

export const PrivacyPolicyScreen = () => {
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
          Your privacy matters to us. This Privacy Policy explains what
          information the app collects, how it is used, and how it is
          protected.
        </Text>

        <Section
          title="1. Information We Collect"
          theme={theme}
        >
          We may collect information you provide when creating and using
          your account, including your display name, username, email
          address, account information, recipes, routines, and other
          content you choose to save in the app.
        </Section>

        <Section
          title="2. How We Use Your Information"
          theme={theme}
        >
          Your information is used to provide and improve the app,
          maintain your account, save your recipes and routines, personalize
          your experience, and provide features that you request.
        </Section>

        <Section
          title="3. Account Information"
          theme={theme}
        >
          Account information is associated with your signed-in account.
          You are responsible for keeping your account credentials secure
          and for the activity performed through your account.
        </Section>

        <Section
          title="4. Your Content"
          theme={theme}
        >
          Content you create in the app, such as recipes and routines, is
          stored so that you can access and use those features. We do not
          claim ownership of the content you create.
        </Section>

        <Section
          title="5. Data Security"
          theme={theme}
        >
          We take reasonable measures to protect information handled by
          the app. However, no electronic storage or transmission method
          can be guaranteed to be completely secure.
        </Section>

        <Section
          title="6. Third-Party Services"
          theme={theme}
        >
          The app may use third-party services to provide authentication,
          storage, analytics, or other functionality. Those services may
          process information according to their own privacy policies.
        </Section>

        <Section
          title="7. Changes to This Policy"
          theme={theme}
        >
          We may update this Privacy Policy as the app develops. When
          changes are made, the updated version will be made available
          inside the app.
        </Section>

        <Section
          title="8. Contact"
          theme={theme}
        >
          If you have questions or concerns about privacy or how your
          information is handled, please contact the app team through the
          support channel provided with the application.
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
