import { Schema, model } from "mongoose";

export interface TagRecord {
  name: string;
}

const tagSchema = new Schema<TagRecord>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);

export const Tag = model<TagRecord>("Tag", tagSchema);
