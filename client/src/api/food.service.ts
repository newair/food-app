import { apiEndpoint } from '../config'
import { Ingredient } from '../types/Ingredient';
import { CreateFoodRequest } from '../types/CreateFoodRequest';
import Axios from 'axios'
import { UpdateFoodRequest } from '../types/UpdateFoodRequest';
import { GenerateURLRequest } from '../types/GenerateURLRequest';
import { Food } from '../types/Food';

export async function getFoods(idToken: string): Promise<Food[]> {
  console.log('Fetching food items')

  const response = await Axios.get(`${apiEndpoint}/foods`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  });
  console.log('Food Items:', response.data);
  return response.data.items;
}

export async function createFood(
  idToken: string,
  newFood: CreateFoodRequest,
): Promise<Food> {
  const response = await Axios.post(`${apiEndpoint}/food`,  JSON.stringify(newFood), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  });
  console.log('food: ', response.data);
  return response.data;
}

export async function patchFoods(
  idToken: string,
  itemId: string,
  updatedFood: UpdateFoodRequest
): Promise<Food> {
  const response = await Axios.patch(`${apiEndpoint}/foods/${itemId}`, JSON.stringify(updatedFood), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data;
}

export async function deleteFood(
  idToken: string,
  itemId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/food/${itemId}`, {
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
  const response = await Axios.post(`${apiEndpoint}/food/${itemId}/attachment`, JSON.stringify(uploadURLData), {
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
