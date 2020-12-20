import inquirer from "inquirer";
import { knex, query } from "./database/knex";

export const getQuestions = async () => {
    const res = await query<{id: string, prompt: string}[]>(
        knex('questions').select('id','prompt').orderBy('order')
    );
    
    return res;
}

export const selectQuestion = async (prompt: string, multiSelect: boolean): Promise<string[]> => {
    const questions = await getQuestions();
    
    if(questions.length === 0){
        console.log("There are no questions in the database, create one before requesting to delete it!");
        return [];
    }

    const { selectedQuestions } = await inquirer.prompt({
        type: multiSelect ? 'checkbox' : 'list',
        name: 'selectedQuestions',
        message: prompt,
        choices: questions.map(({prompt, id}) => ({
            name: prompt,
            value: id,
        }))
    });

    if(multiSelect) {
        return selectedQuestions;
    }
    return [selectedQuestions];
}
