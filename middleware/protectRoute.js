import jwt from "jsonwebtoken";
import Patient from "./../models/PatientAuth_Model.js";
import doctor from "../models/doctorModel.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized - No Token Provided" });
    }
    console.log("token : ",token )

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if (!decoded || !decoded.userId || !decoded.role ) {
        return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }
    console.log("curent userId : " , decoded.userId )


    let user;

    if (decoded.role === "Doctor") {
        user = await doctor.findById(decoded.userId).select("-password");
    } else if (decoded.role === "Patient") {
        user = await Patient.findById(decoded.userId).select("-password");
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    req.userRole = decoded.role; // to know this user doctor or patient

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default protectRoute;
