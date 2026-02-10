import { Router } from 'express'
import { getUserProfile } from '../controllers/user.controller'
import { auth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/profile', auth, getUserProfile)

export default router