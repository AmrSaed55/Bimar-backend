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

const getChatHistory = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: doctorId, receiver: patientId },
        { sender: patientId, receiver: doctorId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({
      status: "success",
      data: messages,
    });
  } catch (err) {
    errorHandler(res, err);
  }
};

export default {
  getChatHistory,
  sendMessage
};
