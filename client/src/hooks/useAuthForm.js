import { useDispatch } from "react-redux";
import { useState, useCallback } from "react";

function useAuthForm(state, formAction) {
  const dispatch = useDispatch();
  // create form data state
  const [formData, setformData] = useState(state);

  // create change handler function

  const changeFormData = useCallback((e) => {
    setformData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  }, []);

  const handleSumbit = useCallback(
    (e) => {
      e.preventDefault();
      dispatch(formAction(formData));
    },
    [formAction, formData, dispatch]
  );

  return { formData, handleSumbit, changeFormData };
}

export default useAuthForm;
