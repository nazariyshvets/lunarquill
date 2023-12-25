import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import express from "express";
import cors from "cors";
import passport from "passport";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import keys from "./config/keys";
import passportConfig from "./config/passport";
import users from "./routes/users";

// App initialization
const init = async () => {
  try {
    const app = express();
    // Bodyparser middleware
    app.use(
      bodyParser.urlencoded({
        extended: false,
      })
    );
    app.use(bodyParser.json());
    // Use CORS
    app.use(cors());

    // DB connection
    await mongoose.connect(keys.mongoURI);
    console.log("MongoDB successfully connected");

    // Passport middleware
    app.use(passport.initialize());
    // Passport config
    passportConfig(passport);
    // Routes
    app.use("/api/users", users);

    // ===== PROTECTED ROUTE EXAMPLE START =====
    const authenticateJWT = passport.authenticate("jwt", { session: false });
    app.get("/api/profile", authenticateJWT, (req, res) => {
      // This route will only be accessible for authenticated users
      res.json({ user: req.user });
    });
    // ===== PROTECTED ROUTE EXAMPLE END =====

    const port = process.env.PORT || 8000;
    app.listen(port, () =>
      console.log(`Server up and running on port ${port}!`)
    );
  } catch (error) {
    console.error(error);
  }
};

init();
