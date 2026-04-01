#  ProofCritic (ScholarMind)
![Node.js](https://img.shields.io/badge/Node.js-20.6+-green?logo=node.js)
![Gemini](https://img.shields.io/badge/Model-Gemini_2.5_Flash-blue?logo=google)
![GitAgent](https://img.shields.io/badge/Framework-GitAgent_v0.1.0-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

> A multi-perspective AI agent designed to simulate the academic peer review process by critically analyzing research papers for methodological soundness, factual accuracy, clarity of presentation, and scholarly contribution.

Built for the **GitAgent Hackathon**.

##  Overview

ProofCritic (powered by the **ScholarMind** orchestrator) is a parallel multi-agent AI system. Instead of relying on a single prompt to review a complex academic paper, it dispatches three highly specialized AI sub-agents to analyze the text simultaneously. 

### The Review Panel
*  **ScholarMind** (Orchestrator) - Manages the pipeline and synthesizes the final verdict.
*  **Dr. Rigor** - Scrutinizes statistical analysis, methodology, and sample sizes.
*  **Prof. Factcheck** - Evaluates citations, literature context, and factual claims.
*  **Ms. Clarity** - Assesses abstract precision, prose accessibility, and structural logic.

---

##  Architecture & GitAgent Standard (v0.1.0)

This project strictly adheres to the GitAgent specification for modular AI design:

* **`agent.yaml`** — Manifest defining name, version, model, skills, and sub-agent registry.
* **`SOUL.md`** — Identity and personality definition for ScholarMind and all 3 sub-agents.
* **`RULES.md`** — Hard constraints and output format contracts.
* **`skills/`** — Modular `SKILL.md` files (statistical-review, fact-check, writing-review, synthesize-report).
* **`agents/`** — Sub-agent definitions (`dr-rigor`, `prof-factcheck`, `ms-clarity`).
* **`memory/`** — Persistent cross-session memory tracking recurring review issues.
* **`knowledge/`** — Shared reference documents injected into all reviewer contexts.
* **`hooks/`** — Lifecycle handlers for bootstrapping and teardown.

---

##  Tech Stack & Runtime

* **Custom Node.js Runtime (`src/`)**: Built on the GitAgent standard to load definitions and orchestrate the pipeline using `Promise.all` for parallel execution.
* **LLM Provider**: Google Gemini 2.5 Flash / 1.5 Flash (Default). Chosen specifically for its massive context window to support parallel sub-agent execution without rate-limiting.
* **Supported Alternatives**: Groq (Llama 3), Ollama (Local), Anthropic Claude.
* **Core Libraries**: 
    * Node.js 20.6+ native `fetch` & native `.env` routing
    * `fs-extra` (File system operations)
    * `chalk` (Terminal output formatting)
    * `@anthropic-ai/sdk` (Streaming support)

---

##  Quick Start & Testing

**Requirements:** Node.js 20.6+ (required for native `.env` routing), a free Gemini API key.

### 1. Clone the repository
```bash
git clone [https://github.com/Nithin-Bhargav-07/Research-paper-peer-review-agent](https://github.com/Nithin-Bhargav-07/Research-paper-peer-review-agent)
cd Research-paper-peer-review-agent

```

### 2. Install dependencies
```Bash
npm install
```

### 4. Configure Environment
Create a .env file in the project root:
```bash
SCHOLAR_PROVIDER=gemini
GEMINI_API_KEY="your_key_here"
```

### 5. Add a Paper
Copy any research paper or abstract and save it as paper.md in the project root. (A demo paper is already included).


### 6. Validation
To validate the GitAgent architecture setup:
```bash
npm run validate
```

### 7. Run the Panel
Run the orchestrator directly from your terminal:
```bash
node --env-file=.env src/index.js
```
