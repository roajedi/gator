import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { and, eq } from "drizzle-orm";

export async function createFeedFollow(
    userId: string,
    feedId: string
) {

    const [newFeedFollow] = await db
        .insert(feedFollows)
        .values({
            userId,
            feedId,
        })
        .returning();


    const result = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            feedName: feeds.name,
            userName: users.name,
        })
        .from(feedFollows)
        .innerJoin(
            feeds,
            eq(feedFollows.feedId, feeds.id)
        )
        .innerJoin(
            users,
            eq(feedFollows.userId, users.id)
        )
        .where(
            eq(feedFollows.id, newFeedFollow.id)
        );


    return result[0];
}



export async function getFeedFollowsForUser(
    userId: string
) {

    return await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            feedName: feeds.name,
            userName: users.name,
        })
        .from(feedFollows)
        .innerJoin(
            feeds,
            eq(feedFollows.feedId, feeds.id)
        )
        .innerJoin(
            users,
            eq(feedFollows.userId, users.id)
        )
        .where(
            eq(feedFollows.userId, userId)
        );
}
export async function deleteFeedFollow(
    userId: string,
    feedUrl: string
): Promise<void> {

     const feed = await db
        .select()
        .from(feeds)
        .where(
            eq(feeds.url, feedUrl)
        );


    if(feed.length === 0){
        throw new Error("Feed not found");
    }

    await db
        .delete(feedFollows)
        .where(
            and(
                eq(
                    feedFollows.userId, userId),
                eq(
                    feedFollows.feedId,feed[0].id)
            )
        );
}