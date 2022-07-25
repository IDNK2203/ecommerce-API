import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../features/auth/authSlice";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logoutThunk);
  };

  return (
    <nav>
      <div className="container nav-container">
        <div className="nav_brand">PhoneStation</div>
        <ul className="navlist">
          <li className="nav-item">
            <Link to={"/"}>Home</Link>
          </li>
          {user ? (
            <li className="nav-item">
              <button onClick={handleLogout}>Logout</button>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link to={"/register"}>Register</Link>
              </li>
              <li className="nav-item">
                <Link to={"/login"}>Login</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
