export interface FoodItem {
  userId: string
  itemId: string
  foodId: string
  ingredientItemIds: string[]
  name: string
  attachmentUrl?: string
}
