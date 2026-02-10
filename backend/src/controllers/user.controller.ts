import { Request, Response } from "express"
import { UserModel } from "../models/User"
import { AuthRequest } from "../middlewares/auth.middleware"

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id

        const user = await UserModel.findById(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json({ data: user })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}