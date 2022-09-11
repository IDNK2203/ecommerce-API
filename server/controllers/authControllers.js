const User = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const { promisify } = require("util");
const crypto = require("crypto");

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendTokenAndResData = async (res, statusCode, user) => {
  const token = await createToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY_DATE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  // TODO delete user when the error occurs in token or cookie creation.
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
  });
  sendTokenAndResData(res, 201, newUser);
});

// @desc    Login into user account
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("email and  password reqiured"));
  }

  const incomingUser = await User.findOne({ email: email }).select("+password");
  if (!incomingUser) {
    return next(new AppError("This user does not exist"));
  }

  if (!(await incomingUser.passwordCheck(password, incomingUser))) {
    return next(new AppError("Incorrect Password, Pls try again"));
  }

  sendTokenAndResData(res, 200, incomingUser);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Get token from header
    token = req.headers.authorization.split(" ")[1];
  }
  // else if (req.cookies.jwt) {
  //     token = req.cookies.jwt;
  //   }
  if (!token) {
    return next(
      new AppError(
        "you are not logged in please log in to view this resource",
        401
      )
    );
  }

  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const incomingUser = await User.findById(decodedPayload.id);
  if (!incomingUser)
    return next(new AppError("This user no longer exists", 401));

  if (incomingUser.updatePasswordAtCheck(decodedPayload.iat))
    // change your account access key after resource access key was created
    return next(
      new AppError(" please log in again to  view this resource", 401)
    );
  req.user = incomingUser;
  console.log(req.user.email);
  return next();
});

// @desc    logout
// @route   POST /api/auth/logout
// @access  Public
exports.logout = (req, res, next) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY_DATE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.clearCookie("jwt", cookieOptions);
  res.status(200).json({
    meassge: "user logged out",
    status: "success",
  });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // steps

  // 1) get user email from post request
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError("This user does not exist", 404));

  // 2) create password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //
  // 3) send token back to user
  const resetUrl = `${req.protocol}//${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetUrl).ResetPassword();

    res.status(200).json({
      status: "sucess",
      message: "your password reset token has been sent to your email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.tokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    console.error(error);
    return next(
      new AppError(
        "An error occured during the email send operation , please try again later",
        500
      )
    );
  }
});

// @desc    Recover Password
// @route   PATCH /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  const enIncomingToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: enIncomingToken,
    tokenExpiresAt: { $gte: Date.now() },
  });
  if (!user)
    return next(
      new AppError("This is an invalid reset token or token has expired ", 404)
    );

  // 4) reset user password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // 5) delete tokenExpiresAt value from dataBase
  user.passwordResetToken = undefined;
  user.tokenExpiresAt = undefined;
  await user.save();

  // update passwordUpdateAt to current time

  // login user
  sendTokenAndResData(res, 201, user);
});

// @desc    Update Password
// @route   PATCH /api/auth/updatepassword
// @access  Public
exports.updatePassword = catchAsync(async (req, res, next) => {
  // steps
  // 1)confirm user password
  const loginUser = await User.findOne({ _id: req.user.id }).select(
    "+password"
  );

  if (!(await loginUser.passwordCheck(req.body.password, loginUser)))
    return next(
      new AppError("please provide your correct current password", 401)
    );

  //set new password
  loginUser.password = req.body.newPassword;
  loginUser.passwordConfirm = req.body.newPasswordConfirm;

  const updatedUser = await loginUser.save();
  updatedUser.password = undefined;
  sendTokenAndResData(res, 201, updatedUser);
});
