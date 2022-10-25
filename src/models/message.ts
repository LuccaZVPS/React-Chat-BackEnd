import { Schema, model } from "mongoose";

interface message {
  sender: string;
  message: string;
  users?: string[];
}
const messageSchema = new Schema<message>(
  {
    sender: { type: String, required: true },
    users: { type: Array, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);
const Message = model<message>("Message", messageSchema);
export default Message;
