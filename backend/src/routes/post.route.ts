import { Router } from 'express'
import { getPosts, getPostDetail } from '../controllers/post.controller'

const router = Router()

router.get('/', getPosts)
router.get('/:postId', getPostDetail)

export default router