import { NextFunction, Router, Response, RequestHandler } from 'express'
import { toggleFollow, getMyFollowers, getMyFollowings, getUserFollowers, getUserFollowings } from '../controllers/follow.controller'
import { auth } from '../middlewares/auth.middleware'
import { param, validationResult } from 'express-validator'

// validation middleware - follow
const followValidation = [
    param('id')
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId'),
]

// validation middleware - get user's followers
const getUserFollowersValidation = [
    param('id')
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId'),
]

// validation middleware - get user's followings
const getUserFollowingsValidation = [
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

router.get('/followers/me', auth, getMyFollowers)
router.get('/following/me', auth, getMyFollowings)
router.get('/followers/:id', auth, getUserFollowersValidation, validate, getUserFollowers)
router.get('/following/:id', auth, getUserFollowingsValidation, validate, getUserFollowings)
router.post('/follow/:id', auth, followValidation, validate, toggleFollow)
router.delete('/follow/:id', auth, followValidation, validate, toggleFollow)

export default router