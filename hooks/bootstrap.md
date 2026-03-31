# Bootstrap Hook Execution

1. **Initialize State:** Read `paper.md` from the root directory and load its contents into active memory.
2. **Check Pre-requisites:** Verify that the paper contains at least an "Abstract" and a "Conclusion" section. If missing, log a critical warning to `memory/MEMORY.md`.
3. **Clear Previous Runs:** Ensure the `reviews/` directory is prepared to receive the new output.
4. **Log Start:** Write the current timestamp and target paper hash to the memory state.