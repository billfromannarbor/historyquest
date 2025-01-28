const fs = require('fs');
const path = require('path');

const questionsDir = path.join(__dirname, 'questions');
const outputFilePath = path.join(__dirname, 'combinedQuestions.json');

function readQuestionsFromFiles() {
    const files = fs.readdirSync(questionsDir);
    const questions = [];

    files.forEach(file => {
        const filePath = path.join(questionsDir, file);
        if (path.extname(file) === '.json') {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            try {
                const question = JSON.parse(fileContent);
                questions.push(question);
            } catch (error) {
                console.error(`Error parsing JSON from file ${file}:`, error);
            }
        }
    });

    return questions;
}

function writeCombinedQuestions(questions) {
    const jsonContent = JSON.stringify(questions, null, 2);
    fs.writeFileSync(outputFilePath, jsonContent, 'utf-8');
    console.log(`Combined questions written to ${outputFilePath}`);
}

function main() {
    const questions = readQuestionsFromFiles();
    writeCombinedQuestions(questions);
}

main(); 