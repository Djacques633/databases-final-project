import { runManage } from "./commands/manage";
import { runReport } from "./commands/report";
import { runTake } from "./commands/take";
import { checkConnection } from "./database/knex";

const help = () => {
    console.log("========= Commands =========");
    console.log("survey manage:\tManage the survey by adding and removing questions");
    console.log("survey take:\tTake the survey");
    console.log("survey report:\tGenerate different reports for the database");

}

export const main = async (args: string[]) => {
    await checkConnection();

    const subcommand = args[2];

    switch(subcommand){
        case "manage": return runManage();
        case "take": return runTake();
        case "report": return runReport();
        default: return help();
    }
}
