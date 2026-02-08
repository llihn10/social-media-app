import { Request, Response, NextFunction, Router } from 'express'
import { login } from '../controllers/auth.controller'
import { body, validationResult } from 'express-validator'

// validation middleware for login 
const loginValidation = [
    body('login').notEmpty().withMessage('Username or email is required').trim(),
    body('password').notEmpty().withMessage('Password is required')
]

// validation result middleware
export const validate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log('Validation errors: ', errors.array())
        res.status(400).json({ errors: errors.array() })
        return
    }

    next()
}

const router = Router()

router.post('/login', loginValidation, validate, login)

export default router