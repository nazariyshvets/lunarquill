import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { PassportStatic } from "passport";
import User from "../models/User";
import keys from "../config/keys";

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.secretOrKey,
};

export default (passport: PassportStatic) => {
  passport.use(
    new Strategy(opts, (jwt_payload, done) => {
      User.findOne({ username: jwt_payload.username })
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => {
          console.error(err);
          return done(err, false);
        });
    })
  );
};
