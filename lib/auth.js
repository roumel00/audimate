import { hash, compare } from "@node-rs/bcrypt"
import User from "@/models/User"
import dbConnect from "./mongoose"

export async function hashPassword(password) {
  return await hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
  return await compare(password, hashedPassword)
}

export async function findUserByEmail(email) {
  await dbConnect()
  return await User.findOne({ email }).lean()
}

export async function createUser({ name, email, password }) {
  await dbConnect()
  const hashedPassword = await hashPassword(password)

  const user = new User({
    name,
    email,
    password: hashedPassword,
  })

  return await user.save()
}
