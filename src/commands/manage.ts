import inquirer from "inquirer";
import { knex, query } from "../database/knex";
import { generateId } from "../database/util";
import { getQuestions, selectQuestion } from "../util";

interface Question {
    prompt: string;
    choices: string[];
}

const showAllQuestions = async () => {
    const questions = await getQuestions();
    for(const [i, question] of questions.entries()){
        console.log(`${i + 1}: ${question.prompt}`);

        const choices = await query<{value: string}[]>(knex('question_choices').select('value').where({question_id: question.id}));
        for(const [i, choice] of choices.entries()){
            console.log(`    - ${choice.value}`);
        }
        console.log();
    }
}

const createQuestion = async () => {
    const question = await inquirer.prompt(
        [
            {
                type: 'input',
                name: 'prompt',
                message: 'What is the question prompt?'
            },
            {
                type: 'list',
                name: 'type',
                message: 'What type of question is this?',
                choices: [
                    'Multiple Choice',
                    'True/False'
                ]
            }
    ]);
    
    const id = generateId();

    let answers: string[] = [];
    if (question.type === 'Multiple Choice') {
        answers = (await inquirer.prompt({
            type: 'input',
            name: 'choices',
            message: 'What are the answer choices? (Seperated by commas)'
        })).choices.split(',');
    } else if (question.type === 'True/False') {
        answers = ['True', 'False'];
    }
    const orderResults = await query<{maxOrder: number}[]>(knex('questions').max('order as maxOrder'));
    const order = orderResults[0] ? orderResults[0].maxOrder + 1 : 1;

    await query(knex('questions').insert({
        prompt: question.prompt,
        order,
        id
    }));

    await query(knex('question_choices').insert(answers.map(answer => ({
        id: generateId(),
        question_id: id,
        value: answer,
    }))));
}

const getFullQuestion = async (id: string): Promise<Question> => {
    const choices = await query<{value: string[]}>(knex('question_choices').select('value').where('question_id', '=', id));
    const questionData = await query<{prompt: string;}>(knex('questions').pluck('prompt').where('id', '=', id).first());
    return {
        prompt: questionData.prompt,
        choices: choices.value
    };
};

const editQuestion = async () => {
    const [questionId] = await selectQuestion('Which question would you like to edit? Note: Only edit questions for misspelling.', false);

    if (!questionId) {
        console.log('You did not select a question');
        return;
    }

    const question: Question = await getFullQuestion(questionId);
    const {newPrompt} = await inquirer.prompt([
        {
            type: 'input',
            name: 'newPrompt',
            message: `Enter a new prompt. Current prompt: ${question.prompt}`
        }
    ]);

    await query(knex('questions').update('prompt', newPrompt).where({
        id: questionId
    }));
}

const deleteQuestion = async () => {
    const questionIds = await selectQuestion('Which question(s) would you like to delete', true);

    if(questionIds.length === 0){
        console.log("You selected no questions, or there are no questions in the database!");
        return;
    }

    await query(knex('questions').delete().whereIn('id', questionIds));
}

const deleteResponse = async () => {
    console.log("Delete response");
    
    const responses = await query<{id: string, user_id: string, submission_timestamp: string}[]>(
        knex('responses').select('id','user_id','submission_timestamp').orderBy('submission_timestamp', 'desc')
    );

    if(responses.length === 0){
        console.log("There are no responses in the database, take the survey before deleting responses!");
        return [];
    }

    const { selectedResponses } = await inquirer.prompt({
        type: 'checkbox',
        name: 'selectedResponses',
        message: 'Which responses would you like to delete?',
        choices: responses.map(response => ({
            name: response.user_id.padEnd(40, ' ') + new Date(response.submission_timestamp).toLocaleString(),
            value: response.id,
            short: response.user_id,
        }))
    });
    
    await query(knex('responses').delete().whereIn('id', selectedResponses));
}

export const runManage = async () => {
    const answer = await inquirer.prompt(
        {
          type: 'list',
          name: 'task',
          message: 'What do you want to do?',
          choices: [
            'Show all questions',
            'Create a question',
            'Edit a question',
            'Delete a question',
            'Delete a response'
          ],
        }
    );
    switch(answer.task) {
        case 'Show all questions': return showAllQuestions();
        case 'Create a question': return createQuestion();
        case 'Edit a question': return editQuestion();
        case 'Delete a question': return deleteQuestion();
        case 'Delete a response': return deleteResponse();
    }
};