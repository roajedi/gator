import { readConfig, setUser } from "./config";
import {createUser, getUserByName, deleteAllUsers, getUsers} from "./lib/db/queries/users";
import {createFeedFollow, getFeedFollowsForUser,deleteFeedFollow} from "./lib/db/queries/feedFollows";

import {fetchFeed} from "./rss";
import {createFeed, getFeeds, getFeedByURL} from "./lib/db/queries/feeds";
import {Feed , User} from "./lib/db/schema";
import {scrapeFeeds} from "./agg";
import {getPostsForUser} from "./lib/db/queries/posts";

 export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;


export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(
    handler: UserCommandHandler
): CommandHandler {

    return async (
        cmdName: string,
        ...args: string[]
    ) => {

        const config = readConfig();


        if(!config.currentUserName){
            throw new Error(
                "No current user"
            );
        }


        const user = await getUserByName(
            config.currentUserName
        );


        if(!user){
            throw new Error(
                `User ${config.currentUserName} not found`
            );
        }


        await handler(
            cmdName,
            user,
            ...args
        );
    };
}

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void>{
    if(args.length === 0){
        throw new Error("username is required");
    }
    const username = args[0];
    const user =await getUserByName (username);

    if(!user){
        throw new Error ("User does not exist");
    }

    setUser(username);

    console.log(`User has been set to ${username}`);
}

export async function handlerRegister(
    cmdName: string,
    ...args: string[]
): Promise<void> {
    if(args.length === 0 ){
        throw new Error ("username is required");
    }
    const username = args[0];

    const existingUser =  await getUserByName(username);

    if(existingUser){
        throw new Error ("User already exists");
    }
    const user =await createUser(username);

    setUser(username);

    console.log("User created successfully!");
    console.log(user);
}

export async function handlerReset(
    cmdName: string,
    ...args: string[]
): Promise<void>{
    await deleteAllUsers();

    console.log("Database reset successfully");

}
export async function handlerUsers(
    cmdName: string,
    ...args: string[]
): Promise<void>{
    const users = await getUsers();
    const config = readConfig();
    for(const user of users){
        if(user.name === config.currentUserName){
            console.log(`* ${user.name} (current)`);
        }
        else{
            console.log (`* ${user.name}`);
        }
    }
}
export async function handlerAgg(
cmdName:string,
...args:string[]
):Promise<void>{

    if(args.length < 1){
        throw new Error("usage: agg <time_between_reqs>");
    }

    const timeBetweenRequests = parseDuration(args[0]);

    console.log(`Collecting feeds every ${args[0]}`);

    await scrapeFeeds();

    const interval = setInterval(()=>{

        scrapeFeeds()
        .catch(console.error);

    }, timeBetweenRequests);

    await new Promise<void>((resolve)=>{

        process.on("SIGINT",()=>{

            console.log(
                "Shutting down feed aggregator...");

            clearInterval(interval);
            resolve();
        });
    });
}

export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {

  if (args.length < 2) {
    throw new Error(
      "usage: addfeed <name> <url>"
    );
  }

  const name = args[0];
  const url = args[1];

  const feed = await createFeed(
    name,
    url,
    user.id
);

  const feedFollow = await createFeedFollow(
    user.id,
    feed.id
);

console.log(`${user.name} is following ${feed.name}`);
}

export async function handleFeeds(
    cmdName: string,
    ...args: string[]
): Promise <void> {
   const allFeeds = await getFeeds();

    for (const feed of allFeeds) {
        console.log(`Name: ${feed.feedName}`);
        console.log(`URL: ${feed.feedURL}`);
        console.log(`User: ${feed.username}`);
        console.log();
    }
}

export async function handlerFollow(
    cmdName:string,
    user: User,
    ...args:string[]
):Promise<void>{
    if(args.length === 0){

        throw new Error("feed url is required");
    }

    const url = args[0];

    const feed = await getFeedByURL(url);

    if(!feed){
        throw new Error("Feed not found");
    }

    const follow =
        await createFeedFollow(
            user.id,
            feed.id
        );

    console.log(`${follow.userName} is following ${follow.feedName}`);
}

export async function handlerFollowing(
    cmdName: string,
    user: User,
    ...args: string[]
): Promise<void> {

    const follows = await getFeedFollowsForUser(
        user.id
    );

    for (const follow of follows) {
        console.log(follow.feedName);
    }
}

export async function handlerUnfollow(
    cmdName: string,
    user: User,
    ...args: string[]
): Promise<void> {


    if(args.length === 0){
        throw new Error("feed url is required");
    }

    const url = args[0];

    await deleteFeedFollow(user.id, url);

    console.log(`${user.name} unfollowed ${url}`);

}

export async function handlerBrowse(
    cmdName:string,
    user:User,
    ...args:string[]
):Promise<void>{

    let limit = 2;

    if(args.length > 0){

        limit = Number(args[0]);

    }

    const posts = await getPostsForUser(
        user.id,
        limit
    );

    for(const post of posts){

        console.log(`Title: ${post.title}
                     URL: ${post.url}
                     Published: ${post.publishedAt}
                     Feed: ${post.feedName}`
        );
    }
}

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void>{
    const handler = registry[cmdName];

    if(!handler){
        throw new Error(`Unknown command: ${cmdName}`);
    }

    await handler(cmdName, ...args);
}

function printFeed(feed: Feed, user: User){
    console.log("Feed created successfully!");

  console.log(`ID: ${feed.id}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
    
}

function parseDuration(durationStr:string):number{

    const regex = /^(\d+)(ms|s|m|h)$/;

    const match = durationStr.match(regex);


    if(!match){
        throw new Error("Invalid duration");
    }


    const amount = Number(match[1]);
    const unit = match[2];


    switch(unit){

        case "ms":
            return amount;

        case "s":
            return amount * 1000;

        case "m":
            return amount * 60 * 1000;

        case "h":
            return amount * 60 * 60 * 1000;

        default:
            throw new Error("Unknown unit");
    }

}