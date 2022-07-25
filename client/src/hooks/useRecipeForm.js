import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createRecipe, updateRecipe } from "../features/recipe/recipeSlice";

function useRecipeForm() {
  // check for url params
  const params = useParams();
  const id = params.id || "";

  // filter to find url recipe item to update
  const recipeToUpdate = useSelector((state) =>
    state.recipes.recipes.filter((el) => el._id === id)
  );

  // create default state obj
  const defualtState = {
    dishName: recipeToUpdate.length > 0 ? recipeToUpdate[0].dishName : "",
  };

  // create default state
  const [formData, setformData] = useState(defualtState);

  // create request status and error msg states
  const [reqStatus, setreqStatus] = useState("idle");
  const [errorMsg, seterrorMsg] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // create form input handler
  const handle_dishName = (e) => {
    setformData({ [e.target.name]: e.target.value });
  };

  // create form sumbit handler
  const handleRecipeForm = async (e) => {
    e.preventDefault();
    try {
      setreqStatus("pending");
      if (id) {
        await dispatch(updateRecipe({ formData, id: params.id })).unwrap();
      } else {
        await dispatch(createRecipe(formData)).unwrap();
      }
      setreqStatus("success");
      navigate("/my-recipes");
    } catch (error) {
      setreqStatus("error");
      seterrorMsg(error);
    }
  };

  return { reqStatus, errorMsg, handle_dishName, handleRecipeForm, formData };
}

export default useRecipeForm;
