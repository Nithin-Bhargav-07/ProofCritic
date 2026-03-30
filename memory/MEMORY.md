# Memory
# ScholarMind: Active Session Memory

*This file tracks the real-time state of the current review process. It is used by the orchestrator to manage handoffs between Dr. Rigor, Prof. Factcheck, and Ms. Clarity.*

## Current Paper Metadata
- **Title:** [PENDING]
- **Author:** [PENDING]
- **Last Commit Hash:** [PENDING]
- **Status:** INITIALIZING / REVIEWING / SYNTHESIZING / COMPLETE

## Active Review Pipeline State

| Agent | Status | Key Flag Raised? | Handoff Note |
| :--- | :--- | :--- | :--- |
| **Dr. Rigor** | Idle | No | Waiting for paper.md input |
| **Prof. Factcheck** | Idle | No | Waiting for paper.md input |
| **Ms. Clarity** | Idle | No | Waiting for paper.md input |

## Intermediate Synthesis Notes
*Orchestrator records cross-agent contradictions or consensus here before final report generation.*

- [ ] Check for contradiction: Did Dr. Rigor flag the same section Ms. Clarity praised?
- [ ] Check for consensus: Have 2+ agents flagged the same "Major" risk?
- [ ] Reference `patterns.md`: Does this paper match any known historical anti-patterns?

## Task Checklist
- [ ] Read and parse `paper.md`
- [ ] Execute specialized reviews (3/3)
- [ ] Update `patterns.md` with new findings
- [ ] Generate final `reviews/review-report.md`
- [ ] Final verdict issued