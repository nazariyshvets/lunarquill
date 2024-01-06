import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import passport from "passport";
import bodyParser from "body-parser";
import connection from "./db";
import passportConfig from "./config/passport";
import authenticateJWT from "./middleware/authenticateJWT";
import auth from "./routes/auth";
import rtc from "./routes/rtc";
import isJSONString from "./utils/isJSONString";

const app = express();

// Connect to DB
(async () => {
  await connection();
})();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
// Use CORS
app.use(cors());
// Passport middleware
app.use(passport.initialize());
// Passport config
passportConfig(passport);
// Routes
app.use("/api/auth", auth);
app.use("/api/rtc", authenticateJWT, rtc);

// ===== PROTECTED ROUTE EXAMPLE START =====
app.get("/api/profile", authenticateJWT, (req, res) => {
  // This route will only be accessible for authenticated users
  res.json({ user: req.user });
});
// ===== PROTECTED ROUTE EXAMPLE END =====

/// Global error handler using express-async-errors
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const errMsg = error.message;
  console.log(error);
  res.status(500).json(isJSONString(errMsg) ? JSON.parse(errMsg) : errMsg);
});

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => console.log(`Server up and running on port ${port}!`));
