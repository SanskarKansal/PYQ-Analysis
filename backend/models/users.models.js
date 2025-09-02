import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
    },
    subjects: { 
        type: Object, // Use Object to store key-value pairs of subjects and their questions
        default: {}
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
