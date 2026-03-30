---
name: writing-review
description: "Evaluates academic tone, structural flow, and formatting clarity."
allowed-tools: Bash Read Write
---

# Writing & Structure Review Execution

## Instructions for Ms. Clarity

1. **Ingest Target:** Read `paper.md`.
2. **Analyze Structure:**
   - Verify the presence of standard academic headers. Flag any missing required sections.
3. **Analyze Tone and Clarity:**
   - Scan for overly dense jargon that obfuscates meaning.
   - Flag sentences longer than 35 words or paragraphs that span more than half a page.
   - Check the Abstract against the "Elevator Pitch Rule" — does it clearly state the problem, method, and conclusion?
4. **Output Formatting:**
   - Output your findings purely as a markdown list.
   - Provide actionable advice for every flaw (e.g., "Break this run-on sentence at line 42 into two distinct thoughts").
   - End your review by identifying one genuine structural or linguistic strength of the paper.