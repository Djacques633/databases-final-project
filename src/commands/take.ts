import inquirer from "inquirer";
import { knex, query } from "../database/knex"
import { generateId } from "../database/util";

export const runTake = async () => {

    const answers: Record<string, string> = {}

    const questions = await query<{id: string, prompt: string}[]>(knex('questions').select('id', 'prompt').orderBy('order'));

    if(questions.length === 0){
        console.log("The survey has no questions yet. Please make some first!");
    }

    const {name} = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is your name?'
    });

    const userAlreadyAnswered = (await query<any[]>(
        knex('responses').select('id').where({ user_id: name })
    )).length > 0;

    if(userAlreadyAnswered){
        console.log("You already took the survey! Please try with another name.");
        return;
    }

    for (const question of questions) {
        const choices = await query<{id: string, value: string}[]>(
            knex('question_choices').select('id', 'value').where({
                question_id: question.id,
            })
        );
        const { selectedChoice } = await inquirer.prompt({
            type: 'list',
            name: 'selectedChoice',
            message: question.prompt,
            choices: choices.map(c => ({
                name: c.value,
                value: c.id,
            })),
        });

        answers[question.id] = selectedChoice;
    }

    const responseId = generateId()

    await query<any>(knex('responses').insert({
        id: responseId,
        user_id: name,
        submission_timestamp: knex.fn.now(),
    }));

    await query<any>(knex('response_answers').insert(Object.entries(answers).map(([questionId, choiceId]) => {
        return {
            response_id: responseId,
            question_id: questionId,
            choice_id: choiceId,
        }
    })));

    console.log("Thank you for taking this survey! Your answers have been submitted.");
}