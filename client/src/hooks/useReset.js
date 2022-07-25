import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { reset } from "../features/auth/authSlice";

function useReset() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);
}

export default useReset;
