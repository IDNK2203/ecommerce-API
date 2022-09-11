const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");

const { Schema } = mongoose;

const cartSchema = new Schema({
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  noOfProducts: {
    type: Number,
    default: 0,
    min: 0,
  },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "product" },
      title: {
        type: String,
      },
      price: {
        type: Number,
      },
      summary: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      subTotal: {
        type: Number,
      },
    },
  ],
});

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
    cartInfo: {
      type: cartSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // if the password was updated(including oc), hash password
  if (!this.isModified("cartInfo") || this.isNew) return next();

  const { products } = this.cartInfo;
  //  cart is modified to having zero products in its product array
  if (products.length === 0) {
    this.cartInfo.totalAmount = 0;
    this.cartInfo.noOfProducts = 0;
    // if one item is in cart product array
  } else if (products.length === 1) {
    this.cartInfo.totalAmount = products[0].subTotal;
    this.cartInfo.noOfProducts = products[0].quantity;
  } else {
    // if more that one item is in cart product array
    const tA = products.reduce((i, j) => {
      return i.subTotal + j.subTotal;
    });
    const nP = products.reduce((i, j) => {
      return i.quantity + j.quantity;
    });
    this.cartInfo.totalAmount = tA;
    this.cartInfo.noOfProducts = nP;
  }

  next();
});

userSchema.pre("save", async function (next) {
  // if the password was updated(including new doc), hash password
  if (!this.isModified("password")) return next();

  this.password = await bcryptjs.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre("save", async function (next) {
  // if the password was updated(excluding new doc), hash password
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
