import { Router, RequestHandler } from 'express'
import { toggleLikePost } from '../controllers/like.controller'
import { auth } from '../middlewares/auth.middleware'
import { param, validationResult } from 'express-validator'

// validation middleware - like post
const likeValidation = [
    param('postId')
        .notEmpty().withMessage('Post ID is required')
        .isMongoId().withMessage('Post ID must be a valid MongoDB ObjectId'),
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

router.post('/:postId/like', auth, likeValidation, validate, toggleLikePost)
router.delete('/:postId/like', auth, likeValidation, validate, toggleLikePost)

export default router