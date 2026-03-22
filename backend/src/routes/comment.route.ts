import { Router, RequestHandler } from 'express'
import { createComment, deleteComment, deleteReply, likeComment, likeReply, replyComment } from '../controllers/comment.controller'
import { auth } from '../middlewares/auth.middleware'
import { body, param, validationResult } from 'express-validator'

// validation middleware - create comment
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

router.post('/:postId', auth, commentValidation, validate, createComment)
router.delete('/:commentId', auth, deleteComment)
router.post('/:commentId/like', auth, likeComment)
router.post('/:commentId/reply', auth, replyComment)
router.post('/:commentId/replies/:replyId/like', auth, likeReply)
router.delete('/:commentId/replies/:replyId', auth, deleteReply)

export default router