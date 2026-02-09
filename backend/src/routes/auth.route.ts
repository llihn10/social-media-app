import { Request, Response, NextFunction, Router } from 'express'
import { login, signup } from '../controllers/auth.controller'
import { body, validationResult } from 'express-validator'

// validation middleware for signup
const signupValidation = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be betwwen 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscore')
        .trim(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
        .withMessage(
            'Password must include uppercase, lowercase, number and special character'
        )
]

// validation middleware for login 
const loginValidation = [
    body('login')
        .notEmpty().withMessage('Username or email is required').trim(),

    body('password')
        .notEmpty().withMessage('Password is required')
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
router.post('/signup', signupValidation, validate, signup)

export default router