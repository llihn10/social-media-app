import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'

export interface AuthRequest extends Request {
    user?: {
        id: string
        role?: string
    }
}

export const auth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' })
        }

        const token = authHeader.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: 'Invalid authorization format' })
        }

        const JWT_SECRET = process.env.JWT_SECRET
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

        if (!decoded.id) {
            return res.status(401).json({ message: 'Invalid token payload' })
        }

        req.user = {
            id: decoded.id,
            role: decoded.role
        }

        console.log('Auth middleware user: ', req.user)

        next()

        // jwt.verify(token, JWT_SECRET, (err, decoded) => {
        //     if (err || !decoded) {
        //         return res.status(400).json({ message: 'Invalid token' })
        //     }

        //     const payload = decoded as JwtPayload

        //     req.userId = payload.id || payload._id || payload.userId

        //     console.log('Auth middleware set userId: ', req.userId)

        //     next()
        // })
    } catch (error) {
        console.error('Auth middleware error: ', error)
        return res.status(401).json({ message: 'Authorization failed' })
    }
}