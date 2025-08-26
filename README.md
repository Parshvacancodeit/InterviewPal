# Lexara.ai  
*AI-powered interview assistant with real-time transcription, intelligent evaluation, and upcoming cheat-detection features.*

![Lexara Logo](./public/lex.png)

---

## 🚀 Overview  
Lexara.ai is an **AI-driven interview prototype** designed to simulate a real interview experience while providing structured evaluation. The system integrates **speech-to-text, text-to-speech, NLP pipelines, and custom evaluation logic** to assess candidate responses dynamically.  

Unlike typical chatbot-style solutions, Lexara.ai focuses on **accuracy, explainability, and human-like assessment**, making it suitable for interview training, evaluation platforms, and adaptive learning systems.

---

## 🎯 Key Features  
- **AI Core**
  - Speech-to-Text (STT) using **Whisper** for robust transcription.
  - Text-to-Speech (TTS) for natural, interactive responses.
  - **Sentence Transformers** for semantic similarity scoring.
  - Custom NLP preprocessing:
    - **Negation handling** (distinguishing "I don’t know" vs "I know").
    - **Contradiction & contradiction resolution**.
    - **Context-aware text cleaning & tokenization**.
  - Multiple transformer models tested (different results across BERT, RoBERTa, and MiniLM families).
  - **Custom evaluation logic** instead of relying on black-box LLMs → transparent and adaptable scoring system.

- **Frontend (React + Vite)**
  - Webcam integration for face-to-face interview simulation.
  - Smooth UI for candidate interaction.
  - Modular design to integrate **cheat-detection add-ons** soon (eye-tracking, tab-switch detection, etc.).

- **Backend (Flask)**
  - Handles AI model inference.
  - Provides APIs for transcription, evaluation, and data persistence.
  - Optimized pipeline for low-latency response.

- **Demo Video**
  - A working demo showcasing the prototype in action.  
  - *(I will publish the demo very shortly.)*

---

## 🛠️ Tech Stack  

**AI / ML**  
- [OpenAI Whisper](https://github.com/openai/whisper) – Speech-to-Text  
- [HuggingFace Transformers](https://huggingface.co/transformers/) – Sentence Transformers (BERT, RoBERTa, MiniLM)  
- Custom preprocessing pipeline (negation, contradiction, text normalization)  
- NLTK / spaCy for auxiliary text processing  

**Frontend**  
- React (Vite)  
- Tailwind CSS (with plans to polish UI further)  
- Webcam & Media APIs  

**Backend**  
- Flask (Python)  
- REST APIs for transcription, evaluation, and logging  

**Infra / Deployment**  
- Currently running locally due to model hosting limitations.  
- Cloud deployment is pending (Render server struggles with model load).  
- Full deployment coming soon with mobile integration planned.  

---

## 🧪 Challenges & Learnings  
- **Latency in transcription & evaluation** → solved via preprocessing and caching strategies.  
- **Model selection** → tried multiple transformer architectures, observed trade-offs in accuracy vs speed.  
- **Evaluation** → LLM-based approaches were inconsistent; built my **own custom scoring system**.  
- **Deployment issues** → Render servers struggled with transformer weights; working on alternatives for smooth hosting.  

---

## 📍 Roadmap  
- ✅ Working prototype with STT, TTS, evaluation.  
- 🔄 Upcoming:  
  - Eye tracking for candidate attentiveness.  
  - Cheat detection (tab-switch, background monitoring).  
  - Mobile-first experience.  
  - Production-ready deployment (cloud-hosted models).  

---

## 📽️ Demo  
I will publish the demo video very shortly. Stay tuned!  

---

## 🛠️ Installation & Setup  

Clone the repo:
```bash
git clone https://github.com/yourusername/lexara-ai.git
cd lexara-ai
