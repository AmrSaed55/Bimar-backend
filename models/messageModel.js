import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderRole", // Dynamic reference
    },
    senderRole: {
      type: String,
      required: true,
      enum: ["Doctor", "Patient"], // Allowed roles
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverRole", // Dynamic reference
    },
    receiverRole: {
      type: String,
      required: true,
      enum: ["Doctor", "Patient"], // Allowed roles
    },
    message: {
      type: String,
      trim: true, // Removes extra spaces
    },
    files: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
