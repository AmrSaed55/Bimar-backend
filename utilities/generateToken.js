import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, role, res) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_KEY);

  // Set cookie with matching expiration
  res.cookie("jwt", token);
};

export default generateTokenAndSetCookie;
