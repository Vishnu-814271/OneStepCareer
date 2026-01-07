
import { GoogleGenAI } from "@google/genai";
import { TestCase, TestResult, User, CourseModule, LearningRecommendation } from "../types";

// Lazy initialization to prevent crash on startup if API key is missing
let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    // Fallback to empty string to prevent constructor error, though API calls will fail without valid key
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return aiInstance;
};

export const generateTutorResponse = async (
  prompt: string, 
  context: string = ""
): Promise<string> => {
  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Course Context: ${context}\nUser Question: ${prompt}`,
      config: {
        systemInstruction: "You are an expert technical tutor for TechNexus Academy. Provide clear, concise, and helpful technical answers.",
      }
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating response. Please check your API Key configuration.";
  }
};

export const runCodeSimulation = async (
  code: string,
  language: string,
  inputData: string = ""
): Promise<string> => {
  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `LANGUAGE: ${language}\n\nCODE TO EXECUTE:\n\`\`\`${language}\n${code}\n\`\`\`\n\nSTANDARD INPUT (stdin):\n${inputData}`,
      config: {
        systemInstruction: `Act as a Code Execution Engine. 
        INSTRUCTIONS:
        1. Simulate the execution of the code strictly.
        2. If the code executes successfully, return ONLY the stdout.
        3. If an error occurs (Syntax, Runtime, etc.), follow this STRICT format:
           ERROR: [Error Name]: [Message]
           DEBUG_TIP: [A human-friendly explanation of why this happened and how to fix it]
           DOC_LINK: [URL to official documentation for this error if applicable]
        
        Example:
        ERROR: IndexError: list index out of range
        DEBUG_TIP: You're trying to access an item at an index that doesn't exist in the list. Check your loop bounds!
        DOC_LINK: https://docs.python.org/3/library/exceptions.html#IndexError`,
      },
    });
    return response.text || "No output.";
  } catch (error) {
    console.error("Execution error:", error);
    return "ERROR: Internal Terminal Error\nDEBUG_TIP: The AI execution engine is currently throttled or API key is missing. Try again in a few moments.";
  }
};

export const validateSolution = async (
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<{ results: TestResult[], referenceCode: string }> => {
  try {
    const prompt = `Language: ${language}\nUser Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nTest Cases:\n${JSON.stringify(testCases.map((tc, i) => ({ id: i, input: tc.input, expected: tc.expectedOutput })))}`;

    const response = await getAi().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        systemInstruction: `Act as an Automated Code Judge and Technical Instructor. 
        Simulate the execution of the code strictly for each test case provided.
        
        If a test case fails due to output mismatch, provide a short "debugTip" in the result object.
        If it fails due to a crash, provide the error details.

        Return a JSON Object with:
        1. "results": array of objects with:
           "id": index,
           "actualOutput": string,
           "passed": boolean,
           "debugTip": string (optional, for failed cases)
        2. "referenceCode": string containing the perfectly optimized, correct solution.
        
        ONLY RETURN VALID JSON.`
      }
    });

    const resultText = response.text || "{ \"results\": [], \"referenceCode\": \"\" }";
    let parsed;
    try {
        parsed = JSON.parse(resultText);
    } catch (e) {
        // Fallback if JSON is malformed
        return { 
           results: testCases.map(tc => ({
             input: tc.input,
             expectedOutput: tc.expectedOutput,
             actualOutput: "Judge Error: Invalid AI Response",
             passed: false,
             isHidden: tc.isHidden
           })), 
           referenceCode: "// Error parsing AI response" 
        };
    }
    
    const results = testCases.map((tc, index) => {
      const judgeResult = parsed.results ? parsed.results.find((r: any) => r.id === index) : null;
      return {
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: judgeResult ? judgeResult.actualOutput : "Runtime Error",
        passed: judgeResult ? judgeResult.passed : false,
        isHidden: tc.isHidden,
        debugTip: judgeResult?.debugTip
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

export const getLearningRecommendation = async (
  user: User,
  availableModules: CourseModule[]
): Promise<LearningRecommendation | null> => {
  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `User Profile:
      - Current Score: ${user.score} XP
      - Plan: ${user.plan || 'Free'}
      - Completed Problems Count: ${user.completedProblems?.length || 0}
      
      Available Modules in Curriculum:
      ${JSON.stringify(availableModules.map(m => ({ title: m.title, language: m.language, category: m.category })))}
      
      TASK: 
      Analyze the student's progress. Select the single best next Course Module they should focus on to advance their career.
      If they are new (score 0), suggest a foundational module.
      If they have some XP, suggest an intermediate one.
      
      Return JSON:
      {
        "recommendedModule": "Exact Title of the module",
        "targetLanguage": "Language of the module",
        "reasoning": "Why this is the best next step (2 sentences max)",
        "estimatedEffort": "e.g., 2 Hours",
        "focusArea": "e.g., Algorithmic Logic, Syntax, etc."
      }`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as LearningRecommendation;
    }
    return null;
  } catch (error) {
    console.error("Recommendation Error:", error);
    return null;
  }
};
