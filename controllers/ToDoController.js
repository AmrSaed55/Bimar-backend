import ToDoModel from "../models/ToDo.js";
const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTodo = new ToDoModel({
      doctorId: req.params.doctorId,
      title,
      description,
      completed: false
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getTodos = async (req, res) => {
  try {
    const todos = await ToDoModel.find({ doctorId: req.params.doctorId });
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const updatedTodo = await ToDoModel.findByIdAndUpdate(
      req.params.todoId,
      { title, description, completed },
      { new: true }
    );
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteTodo = async (req, res) => {
  try {
    await ToDoModel.findByIdAndDelete(req.params.todoId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
};