import { Router } from 'express'
import { getPosts, getPostDetail, getUserPost } from '../controllers/post.controller'
import { auth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', getPosts)
router.get('/my-posts', auth, getUserPost)
router.get('/:postId', getPostDetail)

export default router