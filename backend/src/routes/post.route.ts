import { Router, RequestHandler } from 'express'
import { getPosts, getPostDetail, createNewPost, getMyPost, getUserPost } from '../controllers/post.controller'
import { auth } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/upload.middleware'
import { body, param, validationResult } from 'express-validator'

// validation middleware - create new post 
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

// validation middleware - get user post 
const getUserPostValidation = [
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

router.get('/', auth, getPosts)
router.get('/my-posts', auth, getMyPost)
router.post('/create', auth, upload.array('media', 5), createNewPostValidation, validate, createNewPost)
router.get('/user/:id', auth, getUserPostValidation, validate, getUserPost)
router.get('/:postId', auth, getPostDetail)

export default router