
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Termux Toolkit Assistant", a specialized AI for users running Linux inside Termux on Android.
Your expertise covers:
1. Command generation: Help users write complex shell commands using pkg, apt, and Termux-specific binaries.
2. Scripting: Help write Bash, Python, or Ruby scripts optimized for the mobile environment.
3. Troubleshooting: Explain error codes specific to Android/Termux environments.
4. Security: Provide safe, ethical guidance on networking and system administration.

Always use a professional, slightly technical tone. 
Wrap commands in markdown code blocks: \`pkg install nodejs\`.
Warn users before suggesting destructive commands like 'rm -rf /'.
Mention Termux-specific tools like 'termux-api', 'termux-storage-get', etc., when relevant.
`;

const TERMINAL_SIMULATION_INSTRUCTION = `
You are a high-fidelity Linux Terminal Emulator running inside Termux on an Android device.
The user will input a command. You must respond with the EXACT STDOUT/STDERR output that a Termux environment would produce.

Rules:
1. Provide ONLY the terminal output. 
2. NO conversational text, NO markdown formatting (except for code if necessary, but ideally raw text).
3. NO explanations.
4. If a command is missing, show a bash-style error: "bash: [command]: command not found".
5. If the user asks for a file list (ls), simulate a realistic directory structure (e.g., includes 'storage', 'scripts', 'downloads').
6. Simulate common Termux behavior (e.g., 'pkg' output with progress bars, 'apt' headers).
7. Keep it brief and technical.
`;

const REMOTE_SSH_INSTRUCTION = `
You are simulating a REMOTE SSH SERVER. 
The user is connected to you via SSH from their Termux environment.
The hostname is [HOSTNAME]. The user is [USER].

Rules:
1. Provide ONLY the terminal output of the command.
2. The environment should feel like a standard cloud Linux server (Ubuntu/Debian).
3. If the user runs 'exit', return: "logout\nConnection to [HOSTNAME] closed."
4. Maintain a consistent simulated file system for this session.
5. Do NOT use Termux-specific commands like 'pkg' unless the remote server is another Termux instance (assume standard apt/yum).
`;

const SCRIPT_GEN_INSTRUCTION = `
You are a senior DevOps engineer specialized in Termux.
Your goal is to generate robust, clean, and well-commented bash scripts for tool installation and setup.

Rules:
1. Output ONLY the bash code.
2. No conversational filler like "Here is your script".
3. Use 'pkg' for package management.
4. Include an 'official' look: add a header with tool name and version info.
5. Include basic error handling (e.g., exit if a command fails).
6. Ensure the script is safe for mobile environments.
`;

const QUICK_GUIDE_INSTRUCTION = `
You are a command-line expert and technical instructor.
Your goal is to provide a brief, high-fidelity Quick Guide for commands/utilities inside Termux.

Rules:
1. Provide a concise summary of 3-5 basic, most essential usage commands/options.
2. Format each command clearly with a brief 1-line explanation.
3. Keep it purely in readable markdown.
4. Do NOT include introductory text like "Sure, here's the guide" or conversational filler.
5. Emphasize standard Termux usage and clean command syntax. Keep it dense and informative.
`;

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Unable to connect to the AI assistant. Please check your network or API configuration.";
  }
};

export const simulateCommandExecution = async (command: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Execute this command and show output: ${command}`,
      config: {
        systemInstruction: TERMINAL_SIMULATION_INSTRUCTION,
        temperature: 0.2,
        topP: 0.9,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Command Simulation Error:", error);
    return `bash: ${command.split(' ')[0]}: execution failed (API error)`;
  }
};

export const simulateSshRemoteExecution = async (command: string, user: string, host: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Command on ${user}@${host}: ${command}`,
      config: {
        systemInstruction: REMOTE_SSH_INSTRUCTION.replace('[HOSTNAME]', host).replace('[USER]', user),
        temperature: 0.3,
        topP: 0.9,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("SSH Simulation Error:", error);
    return `ssh: connect to host ${host} port 22: Connection timed out`;
  }
};

export const generateToolScript = async (toolName: string, description: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a bash setup script for ${toolName}. Description: ${description}`,
      config: {
        systemInstruction: SCRIPT_GEN_INSTRUCTION,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    return response.text?.trim() || "# Error generating script";
  } catch (error) {
    console.error("Script Generation Error:", error);
    return "# Error: Failed to contact Gemini API for script generation.";
  }
};

export const generateQuickGuide = async (toolName: string, description: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a concise Quick Guide with 3-5 essential helper commands, options, and basic usage examples for ${toolName}. Description: ${description}`,
      config: {
        systemInstruction: QUICK_GUIDE_INSTRUCTION,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    return response.text?.trim() || "No usage guide generated.";
  } catch (error) {
    console.error("Quick Guide Generation Error:", error);
    return "Error: Failed to contact Gemini API for quick guide generation.";
  }
};
