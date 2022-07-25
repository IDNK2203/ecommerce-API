import { register } from "../features/auth/authSlice";
import useReset from "../hooks/useReset";
import useAuthForm from "../hooks/useAuthForm";
import useAuthRedir from "../hooks/useAuthRedir";

const Register = () => {
  useReset();
  const { handleSumbit, changeFormData, formData } = useAuthForm(
    {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
    register
  );

  const { status, errorMsg } = useAuthRedir();
  return (
    <div className="container">
      <div className="form-container">
        <div className="form-upper"></div>
        <div className="form-heading">
          <h2>Registeration Form</h2>
        </div>
        {status === "pending" && <div>spinner</div>}

        <form className="form-auth" onSubmit={handleSumbit}>
          <p className="form-input-container">
            <label className="form-label" htmlFor="firstName">
              First Name
            </label>
            <input
              className="form-text-input"
              type="text"
              id="firstName"
              name="firstName"
              onChange={changeFormData}
              value={formData.firstName}
            />
          </p>
          <p className="form-input-container">
            <label className="form-label" htmlFor="lastName">
              Last Name
            </label>
            <input
              className="form-text-input"
              type="text"
              id="lastName"
              name="lastName"
              onChange={changeFormData}
              value={formData.lastName}
            />
          </p>
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
            <label className="form-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              className="form-text-input"
              type="password"
              id="confirmPassword"
              name="passwordConfirm"
              onChange={changeFormData}
              value={formData.passwordConfirm}
            />
          </p>
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

export default Register;
