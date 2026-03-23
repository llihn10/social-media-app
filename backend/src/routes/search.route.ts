import { Router } from 'express'
import { searchAll } from '../controllers/search.controller'
import { auth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', auth, searchAll);

export default router