import mongoose from "mongoose";

const AdminSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const AdminAuthModel = mongoose.model("Admins",AdminSchema);

export default AdminAuthModel;