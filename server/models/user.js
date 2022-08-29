const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");

const { Schema } = mongoose;

const cartSchema = new Schema({
  totalAmount:{
    type:Number
  },
  noOfProducts:{
    type:Number
  },
  products:[{
    id:{ type: Schema.Types.ObjectId, ref: 'product' },
    title:{
      type: String,
    },
    price:{
      type:Number
    },
    summary:{
      type: String,
    },
    quantity:{
      type:Number
    }
  }]
})

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "please provide a First Name"],
      minLength: 4,
    },
    lastName: {
      type: String,
      required: [true, "please provide a Last Name"],
      minLength: 4,
    },
    email: {
      type: String,
      required: [true, "please provide an email"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "please provide a valid email",
      },
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "please provide a password"],
      minLength: [8, "password must be atleast a characters"],
      validate: {
        validator: validator.isStrongPassword,
        message:
          "password must contain a uppercase, lowercase, number and a symbol.",
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "please confirm your password"],
      validate: {
        // only works for SAVE and CREATE method
        validator: function (el) {
          return el === this.password;
        },
        message: "password and passwordConfirm value do not match",
      },
    },
    passwordResetToken: String,
    tokenExpiresAt: Date,
    updatePasswordAt: Date,
    cartInfo:cartSchema
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcryptjs.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.updatePasswordAt = Date.now() + 1000;
  next();
});

userSchema.method({
  passwordCheck: async function (incomingPwd) {
    return await bcryptjs.compare(incomingPwd, this.password);
  },
  updatePasswordAtCheck: function (tokenIat) {
    if (this.updatePasswordAt) {
      const passwordDate = new Date(this.updatePasswordAt);
      const tokenDate = new Date(tokenIat * 1000);

      return passwordDate > tokenDate;
    }
    return false;
  },
  createPasswordResetToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.tokenExpiresAt = Date.now() + 10 * 60 * 1000;
    return resetToken;
  },
});

module.exports = mongoose.model("user", userSchema);
