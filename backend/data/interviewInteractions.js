// src/utils/interview-interaction.js

export const greetings = [
  "Hey there! Glad to have you here today.",
  "Hi! Let’s make this a great session together.",
  "Hello! Excited to get started with our interview.",
  "Welcome! Let’s make this an enjoyable learning experience.",
];

export const askForIntroduction = [
  "Could you tell me a little bit about yourself?",
  "Let’s start with a quick introduction about you.",
  "Please share a brief overview of who you are and what you do.",
];

export const postIntroResponses = [
  "Thanks for sharing! Sounds like you have good experience in ${skill}.",
  "Great introduction! I’m sure your background in ${skill} will help here.",
  "That’s a nice summary — let’s dive into the first question now.",
];

export const praiseMessages = [
  "That’s a strong answer!",
  "Well explained! I like how you structured your response.",
  "Nice job! You covered the key points well.",
  "Good thinking! That’s a solid explanation.",
];

export const encouragementMessages = [
  "No worries! Everyone has moments like that.",
  "That’s okay — you can always learn this later.",
  "It’s fine, interviews are about improvement too.",
  "Don’t stress! We’ll move on to the next one.",
];

export const tips = [
  "Remember: In behavioral questions, structure helps — try using STAR (Situation, Task, Action, Result).",
  "In technical answers, start with the concept before diving into details.",
  "Keep your answers concise and relevant to the question.",
  "If you’re unsure, think aloud — it shows your problem-solving process.",
];

// Helper: random item from array
export function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: detect "I don't know" type answers
export function isIDontKnow(text) {
  if (!text) return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("i don't know") ||
    lower.includes("idk") ||
    lower.includes("not sure") ||
    lower.includes("no idea")
  );
}

// Helper: suggest follow-up if answer is short
export function maybeGetFollowUp(text) {
  if (!text || text.split(" ").length < 5) {
    const followUps = [
      "Could you elaborate on that?",
      "Can you explain a bit more?",
      "What made you think of that?",
      "Could you walk me through your reasoning?",
    ];
    return getRandom(followUps);
  }
  return null;
}
