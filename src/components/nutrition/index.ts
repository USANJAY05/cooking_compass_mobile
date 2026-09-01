export { NutritionPanel } from './NutritionPanel';
export { NutritionSection } from './NutritionSection';
export { NutritionSummary } from './NutritionSummary';
export type { NutritionBreakdown, NutritionCategory, NutritionData, NutritionItem } from '../../utils/nutrition';
export {
  prepareNutritionBreakdown,
  hasNutritionContent,
  hasExtendedNutrition,
  getSummaryNutritionItems,
  formatNutritionAmount,
  isNonZeroNutritionAmount,
} from '../../utils/nutrition';
