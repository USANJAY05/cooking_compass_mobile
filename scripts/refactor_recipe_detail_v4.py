from pathlib import Path
import re

screen_path = Path('src/screens/RecipeDetailScreen.tsx')
portion_path = Path('src/components/PortionAdjuster.tsx')
screen = screen_path.read_text()

screen = screen.replace("  useRateRecipe,\n", "")
screen = screen.replace("  Flame,\n  ChevronRight,\n  Beef,\n  Wheat,\n  Droplets,\n  Leaf,\n  Cookie,\n  Waves,\n", "")
screen = screen.replace("  prepareNutritionBreakdown,\n  getSummaryNutritionItems,\n  hasNutritionContent,\n  formatNutritionAmount,\n", "")
screen = screen.replace("import { PortionAdjuster } from '../components/PortionAdjuster';\n", "import { PortionAdjuster } from '../components/PortionAdjuster';\nimport { RecipeRating } from '../components/recipe/RecipeRating';\nimport { RecipeNutrition } from '../components/recipe/RecipeNutrition';\n")

screen = re.sub(r"\nconst findMacro\b.*?\nconst findNutrient\b.*?\n\};\n", "\n", screen, count=1, flags=re.S)
screen = re.sub(r"\n  const nutritionBreakdown =\n.*?\n  const completedStepCount =", "\n  const completedStepCount =", screen, count=1, flags=re.S)

render_start = screen.find('return (', screen.find('if (!recipe)'))
if render_start < 0:
    raise SystemExit('Could not locate RecipeDetail render return')

rating_marker = screen.find('RATING', render_start)
portions_marker = screen.find('PORTIONS', rating_marker)
if rating_marker < 0 or portions_marker < 0:
    raise SystemExit('Could not locate rating/portion markers')
rating_start = screen.rfind('{/*', 0, rating_marker)
portions_start = screen.rfind('{/*', 0, portions_marker)
if rating_start < 0 or portions_start < 0:
    raise SystemExit('Could not locate JSX comment boundaries for rating')

screen = screen[:rating_start] + """{/* ============================================================ */}\n          <RecipeRating\n            rating={recipe.rating}\n            userRating={userRating}\n            isPending={rateMutation.isPending}\n            onRate={handleSelectRating}\n          />\n\n          """ + screen[portions_start:]

nutrition_marker = screen.find('NUTRITION', portions_start)
ingredients_marker = screen.find('INGREDIENTS', nutrition_marker)
if nutrition_marker < 0 or ingredients_marker < 0:
    raise SystemExit('Could not locate nutrition/ingredient markers')
nutrition_start = screen.rfind('{/*', 0, nutrition_marker)
ingredients_start = screen.rfind('{/*', 0, ingredients_marker)
if nutrition_start < 0 or ingredients_start < 0:
    raise SystemExit('Could not locate JSX comment boundaries for nutrition')

screen = screen[:nutrition_start] + """{/* ============================================================ */}\n          <RecipeNutrition\n            nutrition={recipe.nutrition}\n            scale={nutritionScale}\n            portionLabel={portionLabel}\n            onSeeFullBreakdown={() =>\n              navigation.navigate('NutritionDetail', {\n                recipeName: recipe.name,\n                nutrition: recipe.nutrition,\n                scale: nutritionScale,\n                portionLabel,\n              })\n            }\n          />\n\n          """ + screen[ingredients_start:]

portion = portion_path.read_text()
portion = portion.replace("          backgroundColor: theme.colors.surface,\n          borderColor: theme.colors.border,\n", "          backgroundColor: theme.colors.surface,\n", 1)
portion = portion.replace("  container: {\n    borderWidth: 1,\n", "  container: {\n", 1)

if screen.count('<RecipeRating') != 1 or screen.count('<RecipeNutrition') != 1:
    raise SystemExit('Expected exactly one reusable rating and nutrition component')
if 'nutritionBreakdown' in screen:
    raise SystemExit('Inline nutrition implementation remains')

screen_path.write_text(screen)
portion_path.write_text(portion)
print('Final recipe detail extraction completed')
