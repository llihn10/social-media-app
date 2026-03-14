import { Router, RequestHandler } from 'express'
import { createComment } from '../controllers/comment.controller'
import { auth } from '../middlewares/auth.middleware'
import { body, param, validationResult } from 'express-validator'

// validation middleware - like post
const commentValidation = [
    param('postId')
        .notEmpty().withMessage('Post ID is required')
        .isMongoId().withMessage('Post ID must be a valid MongoDB ObjectId'),

    body('content')
        .notEmpty().withMessage('Comment content is required').trim(),
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

router.post('/:postId/comment', auth, commentValidation, validate, createComment)

export default router