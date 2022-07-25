import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// outcome
// 1. check if user object exist then restrict or unrestrict page access.

// protected pages
// if user object exist grant access to page (render page component)
// else redirect user (render redirect component)

// reverse the above operations for auth pages

function AuthRedir({ children, type }) {
  let content;
  const { user } = useSelector((state) => state.auth);
  if (type === "ap") {
    content = user ? <Navigate to="/" /> : <>{children}</>;
  } else {
    content = !user ? <Navigate to="/login" /> : <>{children}</>;
  }
  return content;
}

export default AuthRedir;
