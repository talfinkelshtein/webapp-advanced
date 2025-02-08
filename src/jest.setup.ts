import dotenv from "dotenv";

jest.setTimeout(30000);
console.log = jest.fn((message) => process.stdout.write(message + "\n"));
dotenv.config({ path: ".env.test" });