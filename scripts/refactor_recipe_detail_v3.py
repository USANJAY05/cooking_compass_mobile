from pathlib import Path
import re

screen_path = Path('src/screens/RecipeDetailScreen.tsx')
portion_path = Path('src/components/PortionAdjuster.tsx')
screen = screen_path.read_text()

# Imports.
screen = screen.replace("  useRateRecipe,\n", "")
screen = screen.replace("  Flame,\n  ChevronRight,\n  Beef,\n  Wheat,\n  Droplets,\n  Leaf,\n  Cookie,\n  Waves,\n", "")
screen = screen.replace("  prepareNutritionBreakdown,\n  getSummaryNutritionItems,\n  hasNutritionContent,\n  formatNutritionAmount,\n", "")
screen = screen.replace("import { PortionAdjuster } from '../components/PortionAdjuster';\n", "import { PortionAdjuster } from '../components/PortionAdjuster';\nimport { RecipeRating } from '../components/recipe/RecipeRating';\nimport { RecipeNutrition } from '../components/recipe/RecipeNutrition';\n")

# Remove the old nutrition helper functions.
screen = re.sub(r"\nconst findMacro\b.*?\nconst findNutrient\b.*?\n\};\n", "\n", screen, count=1, flags=re.S)

# Remove nutrition-only derived data.
screen = re.sub(r"\n  const nutritionBreakdown =\n.*?\n  const completedStepCount =", "\n  const completedStepCount =", screen, count=1, flags=re.S)

render_start = screen.find('/* RENDER')
if render_start < 0:
    raise SystemExit('Could not locate RecipeDetail render section')

rating_marker = screen.find('RATING', render_start)
portions_marker = screen.find('PORTIONS', rating_marker)
if rating_marker < 0 or portions_marker < 0:
    raise SystemExit(f'Could not locate rating boundaries: rating={rating_marker}, portions={portions_marker}')

rating_start = screen.rfind('\n', 0, screen.rfind('/*', render_start, rating_marker))
portions_comment_start = screen.rfind('/*', 0, portions_marker)
if rating_start < 0 or portions_comment_start < 0:
    raise SystemExit('Could not calculate rating section boundaries')

rating_replacement = """\n          <RecipeRating\n            rating={recipe.rating}\n            userRating={userRating}\n            isPending={rateMutation.isPending}\n            onRate={handleSelectRating}\n          />\n\n          """
screen = screen[:rating_start] + rating_replacement + screen[portions_comment_start:]

# Nutrition boundaries after the rating replacement.
nutrition_marker = screen.find('NUTRITION', portions_comment_start)
ingredients_marker = screen.find('INGREDIENTS', nutrition_marker)
if nutrition_marker < 0 or ingredients_marker < 0:
    raise SystemExit(f'Could not locate nutrition boundaries: nutrition={nutrition_marker}, ingredients={ingredients_marker}')

nutrition_comment_start = screen.rfind('/*', 0, nutrition_marker)
ingredients_comment_start = screen.rfind('/*', 0, ingredients_marker)
if nutrition_comment_start < 0 or ingredients_comment_start < 0:
    raise SystemExit('Could not calculate nutrition section boundaries')

nutrition_replacement = """\n          <RecipeNutrition\n            nutrition={recipe.nutrition}\n            scale={nutritionScale}\n            portionLabel={portionLabel}\n            onSeeFullBreakdown={() =>\n              navigation.navigate('NutritionDetail', {\n                recipeName: recipe.name,\n                nutrition: recipe.nutrition,\n                scale: nutritionScale,\n                portionLabel,\n              })\n            }\n          />\n\n          """
screen = screen[:nutrition_comment_start] + nutrition_replacement + screen[ingredients_comment_start:]

# Remove only the decorative PortionAdjuster outer border.
portion = portion_path.read_text()
portion = portion.replace("          backgroundColor: theme.colors.surface,\n          borderColor: theme.colors.border,\n", "          backgroundColor: theme.colors.surface,\n", 1)
portion = portion.replace("  container: {\n    borderWidth: 1,\n", "  container: {\n", 1)

if 'RecipeRating' not in screen or 'RecipeNutrition' not in screen:
    raise SystemExit('Reusable components are not referenced')
if 'nutritionBreakdown' in screen:
    raise SystemExit('Inline nutrition implementation remains')

screen_path.write_text(screen)
portion_path.write_text(portion)
print('RecipeDetail refactor applied')
