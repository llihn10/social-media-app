import { FollowModel } from '../models/Follow';

export const isMutualFollow = async (userA: string, userB: string) => {
    const aFollowsB = await FollowModel.exists({ follower: userA, following: userB })
    const bFollowsA = await FollowModel.exists({ follower: userB, following: userA })

    return Boolean(aFollowsB && bFollowsA)
}