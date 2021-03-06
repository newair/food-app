import { Ingredients } from "../components/Ingredients";

export interface UpdateFoodRequest {
  name: string
  ingredientItemIds: string[]
}
