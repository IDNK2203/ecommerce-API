import { login } from "../features/auth/authSlice";
import useReset from "../hooks/useReset";
import useAuthForm from "../hooks/useAuthForm";
import useAuthRedir from "../hooks/useAuthRedir";

const Login = () => {
  useReset();
  const { handleSumbit, changeFormData, formData } = useAuthForm(
    {
      email: "",
      password: "",
    },
    login
  );

  const { status, errorMsg } = useAuthRedir();

  return (
    <div className="container">
      <div className="form-container">
        <div className="form-upper"></div>
        <div className="form-heading">
          <h2>Login Form</h2>
        </div>
        {status === "pending" && <div>spinner</div>}

        <form className="form-auth" onSubmit={handleSumbit}>
          <p className="form-input-container">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              className="form-text-input"
              type="email"
              id="email"
              name="email"
              onChange={changeFormData}
              value={formData.email}
            />
          </p>
          <p className="form-input-container">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-text-input"
              type="password"
              id="password"
              name="password"
              onChange={changeFormData}
              value={formData.password}
            />
          </p>{" "}
          <p className="form-input-container">
            <button className="btn" type="sumbit">
              {" "}
              submit
            </button>
          </p>
        </form>
        {status === "error" && <div>{errorMsg}</div>}
      </div>
    </div>
  );
};

export default Login;
