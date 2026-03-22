import { Router, RequestHandler } from 'express'
import { getNotifications, getUnreadCount, markAllAsRead } from '../controllers/notification.controller'
import { auth } from '../middlewares/auth.middleware'
import { body, param, validationResult } from 'express-validator'

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

router.get('/', auth, getNotifications)
router.get('/unread', auth, getUnreadCount)
router.post('/mark-read', auth, markAllAsRead)

export default router