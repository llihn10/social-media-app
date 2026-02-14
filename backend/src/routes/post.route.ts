import { NextFunction, Router, Response, RequestHandler } from 'express'
import { getPosts, getPostDetail, getUserPost, createNewPost } from '../controllers/post.controller'
import { auth } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/upload.middleware'
import { body, validationResult } from 'express-validator'

// validation middleware for creating new post 
const createNewPostValidation = [
    body('content')
        .notEmpty().withMessage('Story content is required').trim(),

    body('media.*')
        .optional()
        .isString()
        .withMessage('Each media must be a string')
        .matches(/^https:\/\/res\.cloudinary\.com\/.+\.(png|jpg|jpeg)$/i)
        .withMessage('Media must be a valid Cloudinary image URL (png, jpg, jpeg)')
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

router.get('/', auth, getPosts)
router.get('/my-posts', auth, getUserPost)
router.post('/create', auth, createNewPostValidation, validate, upload.array('media', 5), createNewPost)

router.get('/:postId', auth, getPostDetail)

export default router