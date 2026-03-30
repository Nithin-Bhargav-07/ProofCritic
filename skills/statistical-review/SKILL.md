---
name: statistical-review
description: "Evaluates the methodology, sample sizes, and statistical claims of the target paper."
allowed-tools: Bash Read Write
---

# Statistical Review Execution

## Instructions for Dr. Rigor

1. **Ingest Target:** Read `paper.md`.
2. **Isolate Scope:** Focus entirely on the "Methods", "Results", and "Data Availability" sections.
3. **Execution Steps:**
   - Scan for claims containing words like "significant," "proves," "caused," or "highly correlated."
   - For every flagged claim, verify if a corresponding p-value, confidence interval, or effect size is reported in the text or tables. If missing, log a critical error.
   - Evaluate the sample size. If `n < 30` and the author claims broad generalization, flag it as a severe methodological risk.
   - Check for explicitly defined Control and Experimental groups.
4. **Output Formatting:**
   - Output your findings purely as a markdown list.
   - You MUST cite the exact line number or subheading for every critique.
   - Do NOT include introductory or concluding remarks. Just the data.