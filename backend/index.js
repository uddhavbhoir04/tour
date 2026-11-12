import { env } from "./config/env.js";
import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connectDB.js";

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import packageRoute from "./routes/package.route.js";
import ratingRoute from "./routes/rating.route.js";
import bookingRoute from "./routes/booking.route.js";
import aiRoute from "./routes/ai.route.js";
import { settingsRouter, blogRouter, contactRouter, adminRouter } from "./routes/content.route.js";
import { startJobs } from "./jobs/reminders.js";

const app = express();
const __dirname = path.resolve();

app.set("trust proxy", 1); // correct req.ip behind Render/other proxies (rate limits)
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/images", express.static("uploads"));

app.get("/api/health", (req, res) => res.send({ success: true, status: "ok" }));
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/package", packageRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/settings", settingsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRoute);

app.use("/api", (req, res) => res.status(404).send({ success: false, message: "Not found" }));

if (env.isProd) {
  app.use(express.static(path.join(__dirname, "/client/dist")));
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "client", "dist", "index.html")));
} else {
  app.get("/", (req, res) => res.send("Welcome to The Roaming Birds API"));
}

// JSON error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.name === "ValidationError" || err.name === "CastError" || err.name === "MulterError" ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).send({ success: false, message: status >= 500 ? "Something went wrong" : err.message });
});

connectDB()
  .then(() => {
    startJobs();
    app.listen(env.port, () => console.log(`listening on ${env.port}`));
  })
  .catch(() => process.exit(1));
