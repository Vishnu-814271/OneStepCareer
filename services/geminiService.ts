
import { GoogleGenAI } from "@google/genai";
import { TestCase, TestResult, ResumeData } from "../types";

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
    return "ERROR: Internal Terminal Error\nDEBUG_TIP: The AI execution engine is currently throttled. Try again in a few moments.";
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
    const parsed = JSON.parse(resultText);
    
    const results = testCases.map((tc, index) => {
      const judgeResult = parsed.results.find((r: any) => r.id === index);
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

export const generateATSResume = async (
  rawProfile: string,
  jobDescription: string
): Promise<ResumeData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `CANDIDATE PROFILE:\n${rawProfile}\n\nTARGET JOB DESCRIPTION:\n${jobDescription}`,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: `You are a Senior Career Coach and ATS Expert.
        
        Analyze the candidate profile and the Job Description (JD).
        Create a tailored resume structure that highlights the most relevant skills and experience matching the JD.
        
        Return STRICT JSON matching this interface:
        {
          "personalInfo": { "fullName": string, "email": string, "phone": string, "location": string, "linkedin": string, "role": string },
          "summary": string (Professional summary, max 3 sentences, keyword rich),
          "achievements": string[] (List of 3-4 significant key achievements or awards),
          "skills": { "technical": string[], "soft": string[], "tools": string[] },
          "experience": [{ "id": number, "role": string, "company": string, "date": string, "bullets": string[] (3-4 strong achievements per role) }],
          "education": [{ "id": number, "degree": string, "school": string, "date": string }],
          "projects": [{ "id": number, "name": string, "description": string, "techStack": string }]
        }
        
        Ensure "bullets" use strong action verbs (Engineered, Optimized, Deployed).`,
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text) as ResumeData;
    }
    return null;
  } catch (error) {
    console.error("Resume Generation Error:", error);
    return null;
  }
};
