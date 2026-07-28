import {
    CommandsRegistry,
    handlerLogin,
    handlerRegister,
    handlerReset,
    handlerUsers,
    handlerAgg,
    handlerAddFeed,
    handleFeeds,
    handlerFollow,
    handlerFollowing,
    handlerUnfollow,
    handlerBrowse,
    middlewareLoggedIn,
    registerCommand,
    runCommand,
} from "./commands";

async function main(){
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed",middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handleFeeds);
    registerCommand(registry, "follow",middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following",middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));
    const args = process.argv.slice(2);

    if(args.length === 0 ){
        console.error ("Not enough arguments were provided.");
        process.exit(1);
    }
    
    const cmdName = args[0];

    const cmdArgs = args.slice(1);

    try{
        await runCommand(registry,cmdName, ...cmdArgs);
    }catch(err){
        console.error(err);
        process.exit(1);
    }
    process.exit(0);
}
main();
