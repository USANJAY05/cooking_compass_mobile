import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Search,
  X,
  AlertTriangle,
  Plus,
  BookOpen,
} from 'lucide-react-native';
import {
  useRecipes,
  useSearchRecipes,
} from '../api/recipes';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeMenuModal } from '../components/RecipeMenuModal';
import { RecipeSummaryComponent } from '../api/types';
import { useTheme, colors } from '../theme';

export const RecipesMineScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [searchQuery, setSearchQuery] =
    React.useState('');
  const [debouncedQuery, setDebouncedQuery] =
    React.useState('');

  const [
    selectedRecipeForMenu,
    setSelectedRecipeForMenu,
  ] = React.useState<RecipeSummaryComponent | null>(
    null,
  );

  const [isMenuVisible, setIsMenuVisible] =
    React.useState(false);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const isSearching =
    debouncedQuery.trim().length > 0;

  const {
    data: recipesData,
    isLoading: isRecipesLoading,
    error: recipesError,
    refetch: refetchRecipes,
    isRefetching: isRecipesRefetching,
  } = useRecipes({ scope: 'mine' });

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    isRefetching: isSearchRefetching,
  } = useSearchRecipes(debouncedQuery, {
    scope: 'mine',
  });

  const isLoading = isSearching
    ? isSearchLoading
    : isRecipesLoading;

  const error = isSearching
    ? searchError
    : recipesError;

  const recipes = isSearching
    ? searchData?.items
    : recipesData?.items;

  const isRefreshing = isSearching
    ? isSearchRefetching
    : isRecipesRefetching;

  const refetch = isSearching
    ? refetchSearch
    : refetchRecipes;

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const handleLongPressCard = (
    item: RecipeSummaryComponent,
  ) => {
    setSelectedRecipeForMenu(item);
    setIsMenuVisible(true);
  };

  /*
   * ============================================================
   * RECIPE SKELETON
   *
   * Search bar stays visible while only the recipe
   * content area is loading.
   * ============================================================
   */
  const renderSkeleton = () => {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View
            key={item}
            style={[
              styles.skeletonCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.skeletonImage,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />

            <View
              style={styles.skeletonContent}
            >
              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonTitle,
                  {
                    width:
                      item % 2 === 0
                        ? '62%'
                        : '74%',
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />

              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonSubtitle,
                  {
                    width:
                      item % 3 === 0
                        ? '44%'
                        : '55%',
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />

              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonDescription,
                  {
                    width:
                      item % 2 === 0
                        ? '82%'
                        : '68%',
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />

              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonMeta,
                  {
                    width: '38%',
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderError = () => {
    return (
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.stateIcon,
            {
              backgroundColor:
                colors.error + '12',
            },
          ]}
        >
          <AlertTriangle
            size={28}
            color={colors.error}
          />
        </View>

        <Text
          style={[
            styles.errorText,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Failed to load your recipes
        </Text>

        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isSearching) {
      return (
        <View style={styles.centerContainer}>
          <View
            style={[
              styles.stateIcon,
              {
                backgroundColor:
                  colors.info + '12',
              },
            ]}
          >
            <BookOpen
              size={28}
              color={colors.info}
            />
          </View>

          <Text
            style={[
              styles.emptyText,
              {
                color: theme.colors.textMuted,
              },
            ]}
          >
            No recipes match your search
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.stateIcon,
              {
                backgroundColor:
                  theme.colors.primary + '12',
              },
            ]}
          >
            <BookOpen
              size={28}
              color={theme.colors.primary}
            />
          </View>

          <Text
            style={[
              styles.emptyText,
              {
                color: theme.colors.textMuted,
                marginBottom: 16,
              },
            ]}
          >
            You haven&apos;t created any recipes yet
          </Text>

          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor:
                  theme.colors.primary,
              },
            ]}
            onPress={() =>
              navigation.navigate('CreateRecipe')
            }
          >
            <Plus
              size={18}
              color="#fff"
            />

            <Text
              style={styles.createButtonText}
            >
              Create First Recipe
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRecipes = () => {
    return (
      <FlatList
        data={recipes ?? []}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() =>
              navigation.navigate(
                'RecipeDetail',
                {
                  recipeId: item.id,
                },
              )
            }
            onLongPress={() =>
              handleLongPressCard(item)
            }
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          recipes?.length === 0 &&
            styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    );
  };

  const renderContent = () => {
    /*
     * IMPORTANT:
     * Do not replace the whole screen with a loading page.
     *
     * Search bar + tab navigator stay visible.
     * Only the recipe content area becomes skeletons.
     */
    if (isLoading && !isRefreshing) {
      return renderSkeleton();
    }

    if (error && !recipes) {
      return renderError();
    }

    if (!recipes || recipes.length === 0) {
      return renderEmpty();
    }

    return renderRecipes();
  };

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
      {/* ========================================================
          SEARCH BAR
          ======================================================== */}

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              colors.info + '24',
          },
        ]}
      >
        <View
          style={[
            styles.searchIconWrap,
            {
              backgroundColor:
                colors.info + '12',
            },
          ]}
        >
          <Search
            size={17}
            color={colors.info}
          />
        </View>

        <TextInput
          placeholder="Search your recipes..."
          placeholderTextColor={
            theme.colors.textMuted
          }
          style={[
            styles.searchInput,
            {
              color: theme.colors.text,
            },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={[
              styles.clearButton,
              {
                backgroundColor:
                  theme.colors.background,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <X
              size={18}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ========================================================
          CONTENT
          ======================================================== */}

      {renderContent()}

      {/* ========================================================
          RECIPE MENU
          ======================================================== */}

      <RecipeMenuModal
        visible={isMenuVisible}
        recipe={selectedRecipeForMenu}
        onClose={() =>
          setIsMenuVisible(false)
        }
        onOpenRecipe={(recipeId) =>
          navigation.navigate(
            'RecipeDetail',
            {
              recipeId,
            },
          )
        }
        onEditRecipe={(recipeId) =>
          navigation.navigate(
            'EditRecipe',
            {
              recipeId,
            },
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    margin: 16,
    paddingLeft: 10,
    paddingRight: 8,

    minHeight: 50,

    borderRadius: 8,
    borderWidth: 1,
  },

  searchIconWrap: {
    width: 32,
    height: 32,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  searchInput: {
    flex: 1,

    fontSize: 15,
    fontWeight: '600',

    height: '100%',
  },

  clearButton: {
    width: 32,
    height: 32,

    borderRadius: 8,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingBottom: 28,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /*
   * ============================================================
   * SKELETON
   * ============================================================
   */

  skeletonContainer: {
    flex: 1,

    paddingHorizontal: 16,
    paddingBottom: 28,
  },

  skeletonCard: {
    width: '100%',
    minHeight: 126,

    borderRadius: 14,
    borderWidth: 1,

    marginBottom: 12,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',
  },

  skeletonImage: {
    width: 102,
    height: 102,

    borderRadius: 12,

    flexShrink: 0,
  },

  skeletonContent: {
    flex: 1,
    minWidth: 0,

    marginLeft: 12,
  },

  skeletonLine: {
    height: 10,
    borderRadius: 6,
  },

  skeletonTitle: {
    height: 14,
  },

  skeletonSubtitle: {
    height: 8,
    marginTop: 9,
  },

  skeletonDescription: {
    height: 8,
    marginTop: 12,
  },

  skeletonMeta: {
    height: 8,
    marginTop: 10,
  },

  /*
   * ============================================================
   * STATES
   * ============================================================
   */

  centerContainer: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    padding: 32,
  },

  stateIcon: {
    width: 64,
    height: 64,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 14,
  },

  errorText: {
    fontSize: 17,
    lineHeight: 22,

    fontWeight: '800',

    marginBottom: 16,

    textAlign: 'center',
  },

  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,

    borderRadius: 8,
  },

  retryButtonText: {
    color: '#fff',

    fontSize: 14,
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 20,

    fontWeight: '600',

    textAlign: 'center',
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    paddingHorizontal: 20,
    paddingVertical: 12,

    borderRadius: 8,
  },

  createButtonText: {
    color: '#fff',

    fontSize: 14,
    fontWeight: '700',
  },
});