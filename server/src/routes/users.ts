import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import keys from "../config/keys";
import validateRegisterInput from "../validation/register";
import validateLoginInput from "../validation/login";
import User, { IUser } from "../models/User";

const router = express.Router();

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", async (req: Request, res: Response) => {
  try {
    // Form validation
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (existingUser) {
      // Determine if it's the email or username that already exists
      if (existingUser.email === req.body.email) {
        return res.status(400).json({ email: "Email already exists" });
      } else {
        return res.status(400).json({ username: "Username already exists" });
      }
    }

    // Create a new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    // Hash password before saving in the database
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password, salt);

    newUser.password = hash;

    // Save the new user to the database
    await newUser.save();

    return jwt.sign(
      { username: req.body.username },
      keys.secretOrKey,
      {
        expiresIn: 31556926, // 1 year in seconds
      },
      (err, userToken) => {
        if (err) {
          throw err;
        }

        res.json({ userToken });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", async (req: Request, res: Response) => {
  try {
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body);
    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const email: string = req.body.email;
    const password: string = req.body.password;

    // Find user by email
    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Sign token
      return jwt.sign(
        { username: user.username },
        keys.secretOrKey,
        {
          expiresIn: 31556926, // 1 year in seconds
        },
        (err, userToken) => {
          if (err) {
            throw err;
          }

          res.json({ userToken });
        }
      );
    } else {
      return res.status(400).json({ passwordincorrect: "Password incorrect" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

export default router;
