import { Schema, model } from "mongoose";

interface IUser {
  username: string;
  email: string;
  password: string;
  date: Date;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = model<IUser>("User", UserSchema);

export default User;
export { IUser };
