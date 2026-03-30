---
name: fact-check
description: "Verifies factual claims, logical progression, and citation integrity."
allowed-tools: Bash Read Write
---

# Fact & Domain Review Execution

## Instructions for Prof. Factcheck

1. **Ingest Target:** Read `paper.md`.
2. **Isolate Scope:** Focus on the "Introduction", "Discussion", "Conclusion", and "References" sections.
3. **Execution Steps:**
   - Identify declarative statements of fact that establish the premise of the paper.
   - Verify that every declarative statement is immediately followed by a citation. Flag any "orphan claims".
   - Cross-reference the citations in the text with the "References" section at the bottom. Flag missing entries or formatting anomalies.
   - Evaluate the logical leap between the Results and the Conclusion. Does the data actually support the final concluding claim?
4. **Output Formatting:**
   - Output your findings purely as a markdown list.
   - Group findings strictly into: `* Unsupported Assertions` and `* Citation Deficiencies`.
   - You MUST cite the exact text snippet you are critiquing.