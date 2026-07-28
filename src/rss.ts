import {XMLParser} from "fast-xml-parser";

export type RSSFeed = {
    channel: {
        title: string,
        link: string,
        description: string,
        item: RSSItem[]
    };
};

export type RSSItem = {
    title: string,
    link: string,
    description: string,
    pubDate: string
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed>{
    const response = await fetch(feedURL,{
        headers:{
            "User-Agent": "gator",

        },
    });
    const xml = await response.text();

    const parser = new XMLParser({
        processEntities: false,
    });

    const parsed = parser.parse(xml);

    if(!parsed.rss || !parsed.rss.channel){
        throw new Error ("Invaild RSS feed");
    }

    const channel = parsed.rss.channel;

    if(
        typeof channel.title !== "string" ||
        typeof channel.link !== "string" ||
        typeof channel.description !== "string"
    ) {
        throw new Error ("Invaild Rss channel");
    }

    let items = [];

    if(channel.item){
        items = Array.isArray(channel.item)
        ?channel.item
        :[channel.item];
    }

    const rssItems: RSSItem[] = [];

    for (const item of items){
        if(
        typeof item.title !== "string" ||
        typeof item.link !== "string" ||
        typeof item.description !== "string" ||
        typeof item.pubDate !== "string" 
        ) {
            continue;
        }
        rssItems.push({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
        });
    }
    return {
        channel:{
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: rssItems,
        },
    };


}