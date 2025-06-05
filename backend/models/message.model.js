import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel'
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['Customer', 'Repairer']
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel'
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ['Customer', 'Repairer']
    },

    text: {
      type: String,
    },

  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
