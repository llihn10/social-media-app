import { Schema, model } from 'mongoose'
import { IPost } from '../interfaces/post.interface'
import { NotificationModel } from './Notification';
import { LikeModel } from './Like';
import { CommentModel } from './Comment';

const PostSchema = new Schema<IPost>(
    {
        author: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        },
        media: {
            type: [String],
            default: []
        },
        likes_count: {
            type: Number,
            default: 0,
            min: 0
        },
        comments_count: {
            type: Number,
            default: 0,
            min: 0
        },
        isEdited: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
)

PostSchema.pre('findOneAndDelete', async function () {
    try {
        const post = await this.model.findOne(this.getQuery());

        if (post) {
            const postId = post._id;
            await LikeModel.deleteMany({ post_id: postId });
            await CommentModel.deleteMany({ post_id: postId });
            await NotificationModel.deleteMany({ post: postId });
        }
    } catch (error: any) {
        throw error
    }
});

export const PostModel = model<IPost>("Post", PostSchema, "posts")