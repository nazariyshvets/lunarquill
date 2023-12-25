const mongoURI = process.env.MONGO_URI;
const secretOrKey = process.env.SECRET_OR_KEY;

if (!mongoURI || !secretOrKey) {
  throw new Error("Mongo URI or Secret Key is undefined or null");
}

export default {
  mongoURI,
  secretOrKey,
};
