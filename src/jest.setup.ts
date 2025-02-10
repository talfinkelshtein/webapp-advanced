import dotenv from "dotenv";

console.log = jest.fn((message) => process.stdout.write(message + "\n"));
dotenv.config({ path: ".env.test" });