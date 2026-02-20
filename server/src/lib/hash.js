// bcrypt 加密/验证
import bcrypt from "bcryptjs";

export const hashPassword = async (plainText) => {
  return await bcrypt.hash(plainText, 10);
};

export const comparePassword = async (plainText, hash) => {
  return await bcrypt.compare(plainText, hash);
};
