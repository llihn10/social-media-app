import { Router } from 'express'
import { auth, isAdmin } from '../middlewares/auth.middleware'
import { getAdminStats } from '../controllers/admin.controller'

const router = Router()

router.get('/stats', auth, isAdmin, getAdminStats)

export default router