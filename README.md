# Lexara

An AI-powered interview assistant with real-time transcription, intelligent evaluation, and upcoming cheat-detection features.  

[🔗 GitHub Repository](https://github.com/Parshvacancodeit/InterviewPal)  
[🔗 Demo Video (LinkedIn)](https://www.linkedin.com/feed/update/urn:li:activity:7364659164251328512/)  

---

## Overview  
**Lexara** is an AI-driven prototype designed to simulate real interview experiences while providing structured and explainable evaluation.  
It integrates **speech-to-text, text-to-speech, semantic analysis, and custom scoring logic** to evaluate candidate responses in real time.  

This is not just a chatbot-based system — it emphasizes **accuracy, transparency, and adaptability**, making it valuable for:  
- Interview preparation and mock sessions.  
- Recruiter/candidate evaluation.  
- Adaptive learning platforms.  

---

## Features  

### AI & Evaluation  
- **Speech-to-Text (STT)** for live transcription.  
- **Text-to-Speech (TTS)** for natural interaction.  
- **Sentence Transformers** for semantic similarity scoring.  
- **Custom NLP preprocessing pipeline**:  
  - Negation handling (e.g., “I don’t know” vs. “I know”).  
  - Contradiction checks.  
  - Text normalization for consistency.  
- Experimented with multiple transformer models (BERT, RoBERTa, MiniLM) to compare performance.  
- **Custom evaluation logic** instead of relying on black-box LLMs.  

### Frontend (React + Vite)  
- Webcam integration for realistic interview simulation.  
- Clean, modular React components.  
- Modern UI with fast rendering.  

### Backend (Node.js + Express)  
- REST APIs for handling transcription, evaluation, and session management.  
- Efficient middleware for processing audio, text, and scoring.  
- Scalable structure to integrate more AI features later.  

---

## Tech Stack  

**AI / NLP**  
- Sentence Transformers (HuggingFace)  
- NLP preprocessing (negation, contradiction, semantic similarity)  

**Frontend**  
- React (Vite)  
- Tailwind CSS  
- Media APIs (Webcam, Microphone)  

**Backend**  
- Node.js  
- Express.js  
- REST APIs  

**Deployment**  
- Currently running locally due to server constraints on model hosting.  
- Deployment is in progress (Render limitations).  
- Code is ready — cloud deployment and mobile integration will be available very soon.  

---

## Roadmap  

- [ ] Deploy Lexara online (optimize model hosting).  
- [ ] Add **cheat detection** (eye tracking, suspicious behavior detection).  
- [ ] Expand evaluation pipeline with advanced interview metrics.  
- [ ] Mobile support for interviews on the go.  

---

## Demo  

📺 Watch the working demo here:  
[Lexara Demo on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7364659164251328512/)  

---

## Repository  

Source code is available here:  
[Lexara Repository (GitHub)](https://github.com/Parshvacancodeit/InterviewPal)  

---
