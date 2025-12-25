
import { GoogleGenAI } from "@google/genai";
import { TestCase, TestResult } from "../types";

// Initialize the Google GenAI client with the API key from environment variables.
// Use process.env.API_KEY directly as per SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTutorResponse = async (
  prompt: string, 
  context: string = ""
): Promise<string> => {
  try {
    // Use gemini-3-pro-preview for complex technical tutoring and coding tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Course Context: ${context}\nUser Question: ${prompt}`,
      config: {
        systemInstruction: "You are an expert technical tutor for TechNexus Academy. Provide clear, concise, and helpful technical answers.",
      }
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
  try {
    // Use gemini-3-pro-preview for accurate code execution simulation.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `LANGUAGE: ${language}\n\nCODE TO EXECUTE:\n\`\`\`${language}\n${code}\n\`\`\`\n\nSTANDARD INPUT (stdin):\n${inputData}`,
      config: {
        systemInstruction: `Act as a Code Execution Engine. 
        INSTRUCTIONS:
        1. Simulate the execution of the code strictly.
        2. When the code calls input() or similar functions, read values sequentially from the STANDARD INPUT provided.
        3. If input() is called but STANDARD INPUT is empty or exhausted, simulate language-specific behavior (e.g., EOFError for Python).
        4. Return ONLY the STANDARD OUTPUT (stdout). Do not include any explanation, markdown formatting, or preamble.
        5. If there is a syntax error or runtime error, print the error message exactly as the compiler/interpreter would.`,
      },
    });
    return response.text || "No output.";
  } catch (error) {
    console.error("Execution error:", error);
    return "Execution unavailable.";
  }
};

// Validates code against specific test cases using Gemini as an automated judge.
export const validateSolution = async (
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<TestResult[]> => {
  try {
    const prompt = `Language: ${language}\nUser Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nTest Cases:\n${JSON.stringify(testCases.map((tc, i) => ({ id: i, input: tc.input, expected: tc.expectedOutput })))}`;

    // Use gemini-3-pro-preview for complex evaluation tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        systemInstruction: `Act as an Automated Code Judge. 
        Simulate the execution of the code strictly for each test case provided.
        Return a JSON Object with a property "results" which is an array of objects.
        Each object must have:
        - "id": number (matching the test case index)
        - "actualOutput": string (what the code actually produced)
        - "passed": boolean (true if actualOutput matches expected, false otherwise)
        Ignore whitespace differences when comparing (trim outputs).
        ONLY RETURN JSON. NO MARKDOWN.`
      }
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
