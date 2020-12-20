import inquirer from "inquirer";
import { knex, query } from "../database/knex";
import { selectQuestion } from "../util";

const viewQuestionAnswerDistribution = async () => {
    const [questionId] = await selectQuestion("Select a question to view the answer distribution on", false);
    const res = await query<{value: string, count: number}[]>(
        knex('response_answers')
            .select('question_choices.value', knex.raw('COUNT(*) as count'))
            .leftJoin('question_choices', 'question_choices.id', 'response_answers.choice_id')
            .where('question_choices.question_id', questionId)
            .groupBy('question_choices.value')
            .orderBy('count', 'desc')
        );
    
    for(const row of res){
        console.log(`${row.value.padEnd(20, ' ')} | ${row.count} responder${row.count !== 1 ? "s" : ''}`);
    }
}

const numberOfParticipants = async () => {
    const [{ responses }] = await query(knex('responses').count('* as responses'));
    console.log(`There ${responses !== 1 ? 'have' : 'has'} been `, responses, ` response${responses !== 1 ? 's' : ''}.`);
    return;
}

const numberOfQuestions = async () => {
    const [{ questions }] = await query(knex('questions').count('id as questions'));
    console.log("There are ", questions, ` question${questions !== 1 ? 's' : ''}.`);
    return;
}

export const runReport = async () => {
    const answer = await inquirer.prompt(
        {
          type: 'list',
          name: 'task',
          message: 'What do you want to do?',
          choices: [
            'View question answer distribution',
            'View number of answering participants',
            'View number of questions'
          ],
        }
    );
    switch(answer.task) {
        case 'View question answer distribution': return viewQuestionAnswerDistribution();
        case 'View number of answering participants': return numberOfParticipants();
        case 'View number of questions': return numberOfQuestions();
    }
};