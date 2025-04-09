import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, role, res) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_KEY);

  // set cokies
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, 
    secure: process.env.NODE_ENV !== "development",
  });
};

export default generateTokenAndSetCookie;
