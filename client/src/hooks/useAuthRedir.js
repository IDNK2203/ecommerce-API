import { useSelector,  } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function useAuthRedir() {

  const { status, errorMsg } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "success") navigate("/");
  }, [status, navigate]);

  return{status,errorMsg}
  
}

export default useAuthRedir;