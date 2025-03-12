import Message from "../models/messageModel.js";
import mongoose from 'mongoose';
import errorHandler from "../utilities/errorHandler.js";
import Conversation from "../models/conversationModel.js";

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const senderRole = req.userRole;
    let receiverRole;

    console.log("senderRole : ", senderRole)

    if (senderRole == "Doctor"){
      receiverRole = "Patient";
    }else if (senderRole == "Patient"){
      receiverRole = "Doctor";
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    let conversation = await Conversation.findOne({
      $and: [
        { "participants.user": senderObjectId },
        { "participants.user": receiverObjectId }
      ]
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { user: senderObjectId, role: senderRole },
          { user: receiverObjectId, role: receiverRole },
        ],
      });
    }

    const newMessage = new Message({
      senderId,
      senderRole,
      receiverId,
      receiverRole,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    res.status(201).json(newMessage);

  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const userToChatObjectId = new mongoose.Types.ObjectId(userToChatId);

    const conversation = await Conversation.findOne({
      $and: [
        { "participants.user": senderObjectId },
        { "participants.user": userToChatObjectId }
      ]
    }).populate("messages"); // Populate actual messages

    if (!conversation) return res.status(200).json([]);

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export default {
  getMessages,
  sendMessage
};
