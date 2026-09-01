import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { SearchInput } from './SearchInput';

interface SearchListModalProps<T> {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  ListEmptyComponent?: React.ReactElement | null;
  footer?: React.ReactNode;
  enableSearch?: boolean;
  autoFocusSearch?: boolean;
  onRefresh?: () => void | Promise<unknown>;
  isRefreshing?: boolean;
}

export function SearchListModal<T>({
  visible,
  onClose,
  title,
  data,
  keyExtractor,
  renderItem,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  ListEmptyComponent,
  enableSearch = true,
  onRefresh,
  isRefreshing = false,
}: SearchListModalProps<T>) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();


  /*
   * When the modal opens:
   * - Do NOT automatically open the keyboard.
   * - User taps the search field when they want to type.
   */
  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  /*
   * When the modal closes, make sure keyboard is gone.
   */
  useEffect(() => {
    if (!visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  const handleDone = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleListScroll = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleDone}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.headerTitleContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textMuted,
                },
              ]}
            >
              {data.length} {data.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {onRefresh ? (
            <TouchableOpacity
              onPress={() => void onRefresh()}
              disabled={isRefreshing}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Reload list"
              style={[styles.reloadButton, { borderColor: theme.colors.border, opacity: isRefreshing ? 0.5 : 1 }]}
            >
              <Text style={[styles.reloadText, { color: theme.colors.text }]}>Reload</Text>
            </TouchableOpacity>
          ) : null}

          {/* GREEN TICK */}
          <TouchableOpacity
            onPress={handleDone}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Done"
            style={[
              styles.doneButton,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <Check
              size={23}
              color="#FFFFFF"
              strokeWidth={3}
            />
          </TouchableOpacity>
        </View>

        {/* =====================================================
            SEARCH
        ====================================================== */}

        {enableSearch && onSearchChange ? (
          <SearchInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          />
        ) : null}

        {/* =====================================================
            LIST
        ====================================================== */}

        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={ListEmptyComponent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios'
              ? 'interactive'
              : 'on-drag'
          }
          onScrollBeginDrag={handleListScroll}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            data.length === 0 && styles.emptyContent,
          ]}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },

  header: {
    minHeight: 68,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  headerTitleContainer: {
    flex: 1,
    paddingRight: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
  },

  reloadButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  reloadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  doneButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  searchBox: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 14,
    borderWidth: 1,

    paddingHorizontal: 13,
    gap: 9,
  },


  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});