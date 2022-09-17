const fetch = require("node-fetch");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
const User = require("../models/user");
const Order = require("../models/order");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.checkoutCartItems = catchAsync(async (req, res, next) => {
  try {
    const body = {
      tx_ref: "hooli-tx-1920bbtytty",
      amount: "100",
      currency: "NGN",
      redirect_url: "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
      meta: {
        consumer_id: 23,
        consumer_mac: "92a3-912ba-1192a",
      },
      customer: {
        email: "user@gmail.com",
        phonenumber: "080****4528",
        name: "Yemi Desola",
      },
      customizations: {
        title: "Pied Piper Payments",
        logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png",
      },
    };

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });
    const data = await response.json();
    res.status(204).json({
      status: "success",
      data,
    });
    console.log(data);
  } catch (err) {
    console.log(err.code);
    console.log(err.response.body);
  }
});

exports.verifypayment = catchAsync(async (req, res, next) => {
  try {
    if (req.query.status === "successful") {
      const transactionDetails = await flw.Transaction.fetch({
        //bug
        ref: req.query.tx_ref,
      });
      console.log(transactionDetails);
      console.log(req.query.transaction_id);
      const response = await flw.Transaction.verify({
        id: req.query.transaction_id,
      });
      console.log(response);

      if (
        response.data.status === "successful" && //bug
        response.data.amount === transactionDetails.data[0].amount &&
        response.data.currency === "NGN"
      ) {
        // Success! Confirm the customer's payment

        console.log("success yeah");
      } else {
        // Inform the customer their payment was unsuccessful
        console.log(" not success noo");
      }
      res.status(204).json({
        status: "okay",
        data: response.data,
      });
    }
  } catch (err) {
    console.log(err);
    console.log(err.code);
    console.log(err.response);
  }
});
