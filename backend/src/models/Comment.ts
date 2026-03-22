import { Schema, model } from 'mongoose'
import { IComment } from '../interfaces/comment.interface'
import { NotificationModel } from './Notification'

const ReplySchema = new Schema(
    {
        author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
        _id: true
    }
);

const CommentSchema = new Schema<IComment>(
    {
        post_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Post'
        },
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        replies: [ReplySchema],
    },
    {
        timestamps: true,
    }
)

CommentSchema.pre('findOneAndDelete', async function () {
    try {
        const comment = await this.model.findOne(this.getQuery());

        if (comment) {
            await NotificationModel.deleteMany({ comment: comment._id });
            await NotificationModel.deleteMany({ type: 'LIKE_COMMENT', comment: comment._id });
        }
    } catch (error: any) {
        throw error
    }
});

export const CommentModel = model<IComment>("Comment", CommentSchema, "comments")