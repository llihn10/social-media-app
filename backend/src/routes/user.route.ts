import { RequestHandler, Router } from 'express'
import { getMyProfile, getUserProfile } from '../controllers/user.controller'
import { auth } from '../middlewares/auth.middleware'
import { validationResult, param } from 'express-validator'

// validation middleware - get user profile 
const getUserProfileValidation = [
    param('id')
        .notEmpty().withMessage('User ID is required'),
]

// validation result middleware
export const validate: RequestHandler = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log('Validation errors: ', errors.array())
        res.status(400).json({ errors: errors.array() })
        return
    }

    next()
}

const router = Router()

router.get('/profile', auth, getMyProfile)
router.get('/user/:id', auth, getUserProfileValidation, validate, getUserProfile)

export default router