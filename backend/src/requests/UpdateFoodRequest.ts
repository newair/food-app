/**
 * Fields in a request to update a single Ingredient item.
 */
export interface UpdateFoodRequest {
  name: string
  ingredientItemIds: string[]
}