import express from "express";

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import packageRoute from "./routes/package.route.js";
import ratingRoute from "./routes/rating.route.js";
import bookingRoute from "./routes/booking.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "./backend/.env" });
dotenv.config({ path: "../.env" });
import path from "path";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import cookieParser from "cookie-parser";

const app = express();

const __dirname = path.resolve();
connectDB();
app.use(
  cors({
    origin: [
      "http://localhost:5173",                // local frontend
      "https://trb-frontend-lvfk.onrender.com",     // deployed frontend
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/images", express.static("uploads"));
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/package", packageRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/booking", bookingRoute);
app.use("/payment", paymentRoutes);

if (process.env.NODE_ENV_CUSTOM === "production") {
  //static files
  app.use(express.static(path.join(__dirname, "/client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
} else {
  // //rest api
  app.use("/", (req, res) => {
    res.send("Welcome to travel and tourism app");
  });
}

const PORT = process.env.PORT || 8000;

//port
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
