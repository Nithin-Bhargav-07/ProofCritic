# Teardown Hook Execution

1. **Compilation:** Instruct the `synthesize-report` skill to gather the outputs from Dr. Rigor, Prof. Factcheck, and Ms. Clarity.
2. **File Generation:** Write the final synthesized markdown string to `reviews/final-review.md`.
3. **Memory Update:** Extract any new recurring flaws from this review session and append them to `memory/patterns.md` for future learning.
4. **Session Close:** Mark the active session as "COMPLETE" in `memory/MEMORY.md`.