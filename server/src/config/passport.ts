import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { PassportStatic } from "passport";

import User from "../models/User";

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

export default (passport: PassportStatic) => {
  passport.use(
    new Strategy(opts, (jwt_payload, done) => {
      User.findOne({ email: jwt_payload.email })
        .then((user) => done(null, user ?? false))
        .catch((err) => {
          console.log(err);

          return done(err, false);
        });
    }),
  );
};
