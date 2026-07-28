import {getNextFeedToFetch, markFeedFetched} from "./lib/db/queries/feeds";
import {fetchFeed} from "./rss";
import {createPost} from "./lib/db/queries/posts";

export async function scrapeFeeds(){

    const feed = await getNextFeedToFetch();


    if(!feed){
        throw new Error("No feeds found");
    }

    console.log(`Fetching ${feed.name}`);

    const rssFeed = await fetchFeed(feed.url);

    await markFeedFetched(feed.id);

    for(const item of rssFeed.channel.item){

        const publishedAt = new Date(item.pubDate);

    await createPost(
        item.title,
        item.link,
        item.description,
        publishedAt,
        feed.id
    );
    console.log(`Saved post: ${item.title}`);
    }
}