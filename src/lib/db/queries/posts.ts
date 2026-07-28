import {db} from "..";
import {posts, feeds} from "../schema";
import {eq, desc} from "drizzle-orm";

export async function createPost(
    title:string,
    url:string,
    description:string | null,
    publishedAt:Date,
    feedId:string
){

    const [post] = await db
    .insert(posts)
    .values({
        title,
        url,
        description,
        publishedAt,
        feedId,
    })
    .onConflictDoNothing()
    .returning();

    return post;

}

export async function getPostsForUser(
    userId:string,
    limit:number
){

    return await db
    .select({
        id:posts.id,
        title:posts.title,
        url:posts.url,
        description:posts.description,
        publishedAt:posts.publishedAt,
        feedName:feeds.name,
    })
    .from(posts)
    .innerJoin(
        feeds,
        eq(posts.feedId, feeds.id)
    )
    .where(
        eq(feeds.userId,userId)
    )
    .orderBy(
        desc(posts.publishedAt)
    )
    .limit(limit);

}