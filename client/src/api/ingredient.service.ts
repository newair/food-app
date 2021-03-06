import { apiEndpoint } from '../config'
import { Ingredient } from '../types/Ingredient';
import { CreateIngredientRequest } from '../types/CreateIngredientRequest';
import Axios from 'axios'
import { UpdateIngredientRequest } from '../types/UpdateIngredientRequest';
import { GenerateURLRequest } from '../types/GenerateURLRequest';

export async function getIngredients(idToken: string): Promise<Ingredient[]> {
  console.log('Fetching ingredients')

  const response = await Axios.get(`${apiEndpoint}/ingredients`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  });
  console.log('Ingredients:', response.data);
  return response.data.items;
}

export async function createIngredient(
  idToken: string,
  newIngredient: CreateIngredientRequest,
): Promise<Ingredient> {
  const response = await Axios.post(`${apiEndpoint}/ingredients`,  JSON.stringify(newIngredient), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  });
  console.log('ingreditent: ', response.data);
  return response.data;
}

export async function patchIngredient(
  idToken: string,
  itemId: string,
  updatedIngredient: UpdateIngredientRequest
): Promise<Ingredient> {
  const response = await Axios.patch(`${apiEndpoint}/ingredients/${itemId}`, JSON.stringify(updatedIngredient), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data;
}

export async function deleteIngredient(
  idToken: string,
  itemId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/ingredients/${itemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  itemId: string,
  uploadURLData: GenerateURLRequest,
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/ingredient/${itemId}/attachment`, JSON.stringify(uploadURLData), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  return response.data.uploadURL
}

export async function uploadFile(uploadUrl: string, file: Buffer, type: string): Promise<void> {
  await Axios.put(uploadUrl, file, {
    headers: {
    'Content-Type': type,
    }
  })
}
