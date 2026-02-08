import { Request, Response } from "express"
import { UserModel } from "../models/User"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface LoginBody {
    login: string
    password: string
}

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { login, password } = req.body

    try {
        // normalize input
        const normalizedInput = login.toLowerCase().trim()

        // check if input is username or email
        const user = await UserModel.findOne({ $or: [{ username: normalizedInput }, { email: normalizedInput }] })

        if (!user) {
            return res.status(400).json({ message: 'Username or email is not correct' })
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(401).json({ message: 'Incorrect password' })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: '1h' }
        )

        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile_picture: user.profile_picture,
            followers_count: user.followers_count,
            following_count: user.following_count
        }

        res.json({ token, user: userResponse, message: 'Login successfully!' })

    } catch (error) {
        if (error instanceof Error) {
            console.error('Login error:', {
                message: error.message,
                stack: error.stack,
            })
        } else {
            console.error('Login error:', error)
        }
        return res.status(500).json({ message: 'Login failed! Please try again.' });
    }
}
