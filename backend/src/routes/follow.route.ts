import { NextFunction, Router, Response, RequestHandler } from 'express'
import { toggleFollow } from '../controllers/follow.controller'
import { auth } from '../middlewares/auth.middleware'
import { param, validationResult } from 'express-validator'

// validation middleware for creating new post 
const followValidation = [
    param('id')
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId'),
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

router.post('/follow/:id', auth, followValidation, validate, toggleFollow)
router.delete('/follow/:id', auth, followValidation, validate, toggleFollow)

export default router