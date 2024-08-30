import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  name: string;
  participants: mongoose.Types.ObjectId[];
  room: mongoose.Types.ObjectId;
  from: number;
  to: number;
}

const MeetingSchema: Schema = new Schema({
  name: { type: String, required: true },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  ],
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  from: { type: Number, required: true },
  to: { type: Number, required: true },
});

export const Meeting = mongoose.model<IMeeting>("Meeting", MeetingSchema);
