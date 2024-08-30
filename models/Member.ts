import mongoose, { Schema, Document } from "mongoose";

export interface IMember extends Document {
  name: string;
}

const MemberSchema: Schema = new Schema({
  name: { type: String, required: true },
});

export const Member = mongoose.model<IMember>("Member", MemberSchema);
