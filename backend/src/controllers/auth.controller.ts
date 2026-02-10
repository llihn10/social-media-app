import { Request, Response } from "express"
import { UserModel } from "../models/User"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface SignupBody {
    email: string,
    username: string,
    password: string
}

export const signup = async (req: Request<{}, {}, SignupBody>, res: Response) => {
    const { email, username, password } = req.body
    try {
        // normalize input
        const normalizedEmail = email.toLowerCase().trim()
        const normalizedUsername = username.toLowerCase().trim()

        const existedEmail = await UserModel.findOne({ email: normalizedEmail })
        if (existedEmail) {
            return res.status(400).json({ message: 'Email existed! Please log in' })
        }

        const existedUsername = await UserModel.findOne({ username: normalizedUsername })
        if (existedUsername) {
            return res.status(400).json({ message: 'Username existed! Try another one' })
        }

        const newUser = new UserModel({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            profile_picture: '',
            bio: '',
            followers_count: 0,
            following_count: 0,
            role: 'user'
        })

        await newUser.save()

        res.status(201).json({ message: 'Signup successfully!' })

    } catch (error) {
        if (error instanceof Error) {
            console.error('Signup error:', {
                message: error.message,
                stack: error.stack,
            })
        } else {
            console.error('Signup error:', error)
        }
        return res.status(500).json({ message: 'Signup failed! Please try again.' });
    }
}

interface LoginBody {
    identifier: string
    password: string
}

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { identifier, password } = req.body

    try {
        // check if input is email
        const isEmail = identifier.includes('@')

        const user = isEmail
            ? await UserModel.findOne({ email: identifier.toLowerCase() })
            : await UserModel.findOne({ username: identifier })

        if (!user) {
            return res.status(400).json({ message: 'Username or email is not connected to an account. Please sign up' })
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(401).json({ message: 'Incorrect password' })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: '7d' }
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

        res.status(200).json({ token, user: userResponse, message: 'Login successfully!' })

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
