import { Router } from 'express'
import { getInbox, getMessages, accessConversation, sendMessage } from '../controllers/message.controller'
import { auth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/inbox', auth, getInbox)
router.get('/:conversationId', auth, getMessages)
router.post('/conversation', auth, accessConversation)
router.post('/', auth, sendMessage)

export default router
