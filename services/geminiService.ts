import { GoogleGenAI } from "@google/genai";
import { TestCase, TestResult } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateTutorResponse = async (
  prompt: string, 
  context: string = ""
): Promise<string> => {
  if (!apiKey) return "AI Tutor is currently unavailable (Missing API Key).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Context: The user is a student on 'TechNexus Academy'. 
        Course Context: ${context}
        User Question: ${prompt}
        System Instruction: You are an expert technical tutor. Provide clear, concise answers.
      `,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating response.";
  }
};

export const runCodeSimulation = async (
  code: string,
  language: string,
  inputData: string = ""
): Promise<string> => {
  if (!apiKey) return "Error: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Act as a Code Execution Engine.
        
        LANGUAGE: ${language}
        
        CODE TO EXECUTE:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        STANDARD INPUT (stdin):
        ${inputData}
        
        INSTRUCTIONS:
        1. Simulate the execution of the code strictly.
        2. When the code calls input() or similar functions, read values sequentially from the STANDARD INPUT provided above.
        3. If input() is called but STANDARD INPUT is empty or exhausted, simulate an EOFError or empty string depending on language behavior, but preferably just stop reading.
        4. Return ONLY the STANDARD OUTPUT (stdout). Do not include any explanation, markdown formatting, or preamble.
        5. If there is a syntax error or runtime error, print the error message exactly as the compiler/interpreter would.
      `,
    });
    return response.text || "No output.";
  } catch (error) {
    return "Execution unavailable.";
  }
};

// New Function: Validates code against specific test cases
export const validateSolution = async (
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<TestResult[]> => {
  if (!apiKey) {
    // Mock failure if no API key
    return testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: "API Key Missing",
      passed: false,
      isHidden: tc.isHidden
    }));
  }

  try {
    // We ask Gemini to act as a judge and run the code mentally for each input
    const prompt = `
      Act as an Automated Code Judge.
      
      Language: ${language}
      User Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      I will provide a list of test cases (Input -> Expected Output).
      For EACH test case, simulate the execution of the code strictly.
      
      Test Cases:
      ${JSON.stringify(testCases.map((tc, i) => ({ id: i, input: tc.input, expected: tc.expectedOutput })))}
      
      Return a JSON Object with a property "results" which is an array of objects.
      Each object must have:
      - "id": number (matching the test case index)
      - "actualOutput": string (what the code actually produced)
      - "passed": boolean (true if actualOutput matches expected, false otherwise)
      
      Ignore whitespace differences (trim outputs).
      ONLY RETURN JSON. NO MARKDOWN.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const resultText = response.text || "{ \"results\": [] }";
    const parsed = JSON.parse(resultText);
    
    // Map back to our TestResult type
    return testCases.map((tc, index) => {
      const judgeResult = parsed.results.find((r: any) => r.id === index);
      return {
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: judgeResult ? judgeResult.actualOutput : "Error",
        passed: judgeResult ? judgeResult.passed : false,
        isHidden: tc.isHidden
      };
    });

  } catch (error) {
    console.error("Validation Error:", error);
    return testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: "Judge Error",
      passed: false,
      isHidden: tc.isHidden
    }));
  }
};