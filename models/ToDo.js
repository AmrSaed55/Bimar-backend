import mongoose from "mongoose";

const ToDoSchema = mongoose.Schema({
    doctorId: String,
    title: String,
    description: String,
    completed: Boolean
});

const ToDoModel = mongoose.model("ToDos", ToDoSchema);

export default ToDoModel;