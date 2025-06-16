import ToDoController from "../controllers/ToDoController.js";
import express from "express";
const router = express.Router();

router.post("/:doctorId/todos", ToDoController.createTodo);
router.get("/:doctorId/todos", ToDoController.getTodos);
router.put("/:doctorId/todos/:todoId", ToDoController.updateTodo);
router.delete("/:doctorId/todos/:todoId", ToDoController.deleteTodo);

export default router;