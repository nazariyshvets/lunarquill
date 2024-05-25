import { Schema, model, Document } from "mongoose";

interface IToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

const TokenSchema = new Schema<IToken>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600,
  },
});

const Token = model<IToken>("Token", TokenSchema);

export default Token;
export { IToken };
