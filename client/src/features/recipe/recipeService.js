import axios from "axios";

const baserUrl = "http://localhost:4000/api/v1/recipe/";

export const myRecipesService = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(baserUrl + "myrecipe", config);
  return response.data.recipes;
};

export const createRecipeService = async (token, formData) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(baserUrl, formData, config);
  return response.data;
};

export const updateRecipeService = async (token, data) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.patch(
    `${baserUrl}/${data.id}`,
    data.formData,
    config
  );
  console.log(response);
  return response.data;
};

export const deleteRecipeService = async (token, id) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${baserUrl}/${id}`, config);
  return response.data;
};
