const express = require("express");
const logger = require("morgan");
const AppError = require("./utils/appError");
const globalErrorhandler = require("./controllers/errorControllers");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// Route
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

// setup express app
const app = express();

// boilerplate middleware
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

if (app.get("env") !== "production") {
  app.use(logger("dev"));
}

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `This url ${req.originalUrl} was not found on this server.`,
      404
    )
  );
});

app.use(globalErrorhandler);

module.exports = app;
