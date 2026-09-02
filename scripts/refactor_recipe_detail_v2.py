from pathlib import Path
import re

screen_path = Path('src/screens/RecipeDetailScreen.tsx')
portion_path = Path('src/components/PortionAdjuster.tsx')
screen = screen_path.read_text()

screen = screen.replace("  useRateRecipe,\n", "")
screen = screen.replace("  Flame,\n  ChevronRight,\n  Beef,\n  Wheat,\n  Droplets,\n  Leaf,\n  Cookie,\n  Waves,\n", "")
screen = screen.replace("  prepareNutritionBreakdown,\n  getSummaryNutritionItems,\n  hasNutritionContent,\n  formatNutritionAmount,\n", "")
screen = screen.replace("import { PortionAdjuster } from '../components/PortionAdjuster';\n", "import { PortionAdjuster } from '../components/PortionAdjuster';\nimport { RecipeRating } from '../components/recipe/RecipeRating';\nimport { RecipeNutrition } from '../components/recipe/RecipeNutrition';\n")

# Move nutrition lookup helpers out of the screen.
screen = re.sub(r"\nconst findMacro = \(.*?\n\};\n\nconst findNutrient = \(.*?\n\};\n", "\n", screen, count=1, flags=re.S)

# Remove the nutrition-only derived-data block.
screen = re.sub(r"\n  const nutritionBreakdown =\n.*?\n  const completedStepCount =", "\n  const completedStepCount =", screen, count=1, flags=re.S)

# Replace rating section using the exact comment boundaries.
rating_pattern = r"\n          /\* ============================================================ \*/\n          /\* RATING.*?\n          /\* PORTIONS"
rating_replacement = """\n          <RecipeRating\n            rating={recipe.rating}\n            userRating={userRating}\n            isPending={rateMutation.isPending}\n            onRate={handleSelectRating}\n          />\n\n          {/* ============================================================ */}\n          {/* PORTIONS"""
screen, rating_count = re.subn(rating_pattern, rating_replacement, screen, count=1, flags=re.S)

# Replace nutrition section using the exact comment boundaries.
nutrition_pattern = r"\n          /\* ============================================================ \*/\n          /\* NUTRITION.*?\n          /\* INGREDIENTS"
nutrition_replacement = """\n          <RecipeNutrition\n            nutrition={recipe.nutrition}\n            scale={nutritionScale}\n            portionLabel={portionLabel}\n            onSeeFullBreakdown={() =>\n              navigation.navigate('NutritionDetail', {\n                recipeName: recipe.name,\n                nutrition: recipe.nutrition,\n                scale: nutritionScale,\n                portionLabel,\n              })\n            }\n          />\n\n          {/* ============================================================ */}\n          {/* INGREDIENTS"""
screen, nutrition_count = re.subn(nutrition_pattern, nutrition_replacement, screen, count=1, flags=re.S)

# Only remove the decorative outer PortionAdjuster border.
portion = portion_path.read_text()
portion = portion.replace("          backgroundColor: theme.colors.surface,\n          borderColor: theme.colors.border,\n", "          backgroundColor: theme.colors.surface,\n", 1)
portion = portion.replace("  container: {\n    borderWidth: 1,\n", "  container: {\n", 1)

if rating_count != 1:
    raise SystemExit(f'Expected one rating section, found {rating_count}')
if nutrition_count != 1:
    raise SystemExit(f'Expected one nutrition section, found {nutrition_count}')
if 'RecipeRating' not in screen or 'RecipeNutrition' not in screen:
    raise SystemExit('Reusable components were not wired into RecipeDetailScreen')
if 'nutritionBreakdown' in screen:
    raise SystemExit('Nutrition implementation was not fully extracted')

screen_path.write_text(screen)
portion_path.write_text(portion)
print('RecipeDetailScreen and PortionAdjuster updated')
