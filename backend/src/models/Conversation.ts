import { Schema, model } from 'mongoose'
import { IConversation } from '../interfaces/conversation.interface'

const ConversationSchema = new Schema<IConversation>(
    {
        participants: {
            type: [Schema.Types.ObjectId],
            ref: 'User',
            required: true
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
        updatedAt: { type: Date, default: Date.now }
    },
    {
        timestamps: true,
    }
)

ConversationSchema.index({ participants: 1 })

export const ConversationModel = model<IConversation>("Conversation", ConversationSchema, "conversations")