
import { GoogleGenAI } from "@google/genai";
import { TestCase, TestResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTutorResponse = async (
  prompt: string, 
  context: string = ""
): Promise<string> => {
  try {
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

export const validateSolution = async (
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<{ results: TestResult[], referenceCode: string }> => {
  try {
    const prompt = `Language: ${language}\nUser Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nTest Cases:\n${JSON.stringify(testCases.map((tc, i) => ({ id: i, input: tc.input, expected: tc.expectedOutput })))}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        systemInstruction: `Act as an Automated Code Judge and Technical Instructor. 
        Simulate the execution of the code strictly for each test case provided.
        
        Return a JSON Object with:
        1. "results": array of objects with "id", "actualOutput", "passed".
        2. "referenceCode": string containing the perfectly optimized, correct solution for this problem in the requested language.
        
        Ignore whitespace differences when comparing (trim outputs).
        ONLY RETURN VALID JSON.`
      }
    });

    const resultText = response.text || "{ \"results\": [], \"referenceCode\": \"\" }";
    const parsed = JSON.parse(resultText);
    
    const results = testCases.map((tc, index) => {
      const judgeResult = parsed.results.find((r: any) => r.id === index);
      return {
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: judgeResult ? judgeResult.actualOutput : "Runtime Error",
        passed: judgeResult ? judgeResult.passed : false,
        isHidden: tc.isHidden
      };
    });

    return { results, referenceCode: parsed.referenceCode || "" };

  } catch (error) {
    console.error("Validation Error:", error);
    return {
      results: testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: "Judge Error",
        passed: false,
        isHidden: tc.isHidden
      })),
      referenceCode: "// Correction unavailable due to system load."
    };
  }
};
