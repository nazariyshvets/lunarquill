import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import passport from "passport";
import bodyParser from "body-parser";

import connection from "./db";
import router from "./routes/main";
import isJSONString from "./utils/isJSONString";
import passportConfig from "./config/passport";

const app = express();

// Connect to DB
(async () => await connection())();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());
// Use CORS
app.use(cors());
// Passport middleware
app.use(passport.initialize());
// Passport config
passportConfig(passport);
// Routes
app.use("/api", router);

/// Global error handler using express-async-errors
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const errMsg = error.message;

  console.log(error);
  res.status(500).json(isJSONString(errMsg) ? JSON.parse(errMsg) : errMsg);
});

const port = Number(process.env.PORT) || 8000;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));
