import jwt from "jsonwebtoken";

function getJwtSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET env variable");
  }
  return JWT_SECRET;
}

export const signToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};
