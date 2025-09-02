import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
    topic: String,
    count: Number,
});

export const TopicModel = mongoose.model("Topic", topicSchema);
