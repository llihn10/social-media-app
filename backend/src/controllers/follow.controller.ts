import { Request, Response } from "express";
import { AuthRequest } from '../middlewares/auth.middleware'
import { UserModel } from '../models/User'
import { FollowModel } from "../models/Follow"

export const toggleFollow = async (req: any, res: Response) => {
    const targetUserId: string = req.params.id
    const userId = req.user!.id
    try {
        const existingFollow = await FollowModel.findOne({
            follower: userId,
            following: targetUserId
        })

        if (existingFollow) {
            // unfollow
            await FollowModel.findByIdAndDelete(existingFollow._id)
            await UserModel.findByIdAndUpdate(userId, { $inc: { following_count: -1 } })
            await UserModel.findByIdAndUpdate(targetUserId, { $inc: { followers_count: -1 } })
            return res.status(200).json({ followed: false })
        } else {
            // follow
            await FollowModel.create({ follower: userId, following: targetUserId })
            await UserModel.findByIdAndUpdate(userId, { $inc: { following_count: 1 } })
            await UserModel.findByIdAndUpdate(targetUserId, { $inc: { followers_count: 1 } })
            return res.status(200).json({ followed: true })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

const fetchFollowerList = async (
    { targetUserId, viewerId }: { targetUserId: string, viewerId?: string }
) => {
    const followers = await FollowModel
        .find({ following: targetUserId })
        .populate('follower', '_id username profile_picture')
        .lean()

    const followerIds = followers.map(f => f.follower._id)

    let followedSet = new Set<string>()
    if (viewerId) {
        const followedByViewer = await FollowModel.find({
            follower: viewerId,
            following: { $in: followerIds }
        }).lean()

        followedSet = new Set(
            followedByViewer.map(f => f.following.toString())
        )
    }

    return followers.map(f => ({
        ...f.follower,
        is_followed: followedSet.has(f.follower._id.toString())
    }))
}

export const fetchFollowingList = async (
    { targetUserId, viewerId }: { targetUserId: string; viewerId?: string }
) => {
    const followings = await FollowModel
        .find({ follower: targetUserId })
        .populate('following', '_id username profile_picture')
        .lean()

    const followingIds = followings.map((f: any) => f.following._id)

    let followingSet = new Set<string>()

    if (viewerId) {
        const followingByViewer = await FollowModel.find({
            follower: viewerId,
            following: { $in: followingIds }
        }).lean()

        followingSet = new Set(
            followingByViewer.map((f: any) => f.following.toString())
        )
    }

    return followings.map((f: any) => ({
        ...f.following,
        is_followed: followingSet.has(f.following._id.toString())
    }))
}

export const getMyFollowers = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id

        const data = await fetchFollowerList({
            targetUserId: userId,
            viewerId: userId
        })

        res.status(200).json({ data })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getMyFollowings = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id

        const data = await fetchFollowingList({
            targetUserId: userId,
            viewerId: userId
        })

        res.status(200).json({ data })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getUserFollowers = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id
        const targetUserId = req.params.id

        const data = await fetchFollowerList({
            targetUserId: targetUserId,
            viewerId: userId
        })

        res.status(200).json({ data })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getUserFollowings = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id
        const targetUserId = req.params.id

        const data = await fetchFollowingList({
            targetUserId: targetUserId,
            viewerId: userId
        })

        res.status(200).json({ data })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}