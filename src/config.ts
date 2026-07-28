import fs from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName?: string;
}

function getConfigFilePath(): string {
    const HomeDirPath = os.homedir();
    return path.join(HomeDirPath, ".gatorconfig.json");
}

export function readConfig(): Config {
    const filePath = getConfigFilePath();
    const data = fs.readFileSync(filePath,"utf-8");
    const rawConfig = JSON.parse(data);
    return validateConfig(rawConfig);
}

function validateConfig(rawConfig: any):Config {
 const config: Config = {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name
 }
 return config;
}

function writeConfig(cfg: Config): void {
  const rawConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };
 const json = JSON.stringify(rawConfig, null, 2);

 fs.writeFileSync(getConfigFilePath(), json);

}

export function setUser(username: string): void{
    const config= readConfig();
    config.currentUserName = username;
    writeConfig(config);
}
