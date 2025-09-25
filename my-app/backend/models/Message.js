import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  file: {
    name: String,
    path: String,
  },
  id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId() }, // add unique id
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;
