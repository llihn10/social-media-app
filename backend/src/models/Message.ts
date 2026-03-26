import { Schema, model } from 'mongoose'
import { IMessage } from '../interfaces/message.interface'

const MessageSchema = new Schema<IMessage>(
    {
        conversation_id: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
)

MessageSchema.index({ conversation_id: 1, createdAt: -1 })

export const MessageModel = model<IMessage>("Message", MessageSchema, "messages")