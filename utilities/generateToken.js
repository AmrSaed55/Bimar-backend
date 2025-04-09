import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, role, res) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_KEY);

  // Set cookie with matching expiration
  res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
};

export default generateTokenAndSetCookie;
