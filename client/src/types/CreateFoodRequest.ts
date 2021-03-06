import { Ingredients } from "../components/Ingredients";

export interface CreateFoodRequest {
  name: string
  ingredientItemIds: string[]
}
