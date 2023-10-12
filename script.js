import { config } from "dotenv"; //import the `config` function from the `dotenv` npm package
config(); //performs actual reading and finds the .env file in the root directory

import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

import fs from 'fs/promises';

const optionalFileArgs = process.argv.slice(2); //process.argv[0] is the path to the Node.js executable. process.argv[1] is the path to the script that's being executed. process.argv[2], process.argv[3], etc., contain the arguments passed to the script.
const defaultFile = 'default.txt';
const outputFile = 'output.txt';

const readDefaultFile = async () =>{
    try{
        let fileContent = await fs.readFile(defaultFile, 'utf-8');
        return fileContent;
    } catch (err) {
        console.error("Error reading file from disk:", err);
    }
}

const readMultipleFiles = async (files) =>{
    let fileContent = "";
    for (const file of files){
        try{
            fileContent += await fs.readFile(file, 'utf-8');
        } catch (err) {
            console.error("Error reading file from disk:", err);
        }
    }
    return fileContent;
}

let message = "";
if (optionalFileArgs.length == 0){
    message = await readDefaultFile();
}
else{
    message = await readMultipleFiles(optionalFileArgs);
}

//console.log(message);

const chatCompletion = await openai.chat.completions.create({
    /*
    As of Oct 2023:
    Model               | Tokens
    "gpt-4"             | 8192
    "gpt-4-32k"         | 32768
    "gpt-3.5-turbo"     | 4097
    "gpt-3.5-turbo-16k" | 16385
    */
    model: "gpt-4",
    messages: [{ "role": "user", "content": message}],
    temperature: 0
});

let response = chatCompletion.choices[0].message.content;

try {
    await fs.writeFile(outputFile, response, { flag: 'w' });
} catch (err) {
    console.error("Error:", err);
}