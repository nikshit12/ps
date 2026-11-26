# ETF research MVP team

Use the [architecture and milestone exit criteria](docs/architecture-etf-reports/architecture-etf-reports.md) for product and technical decisions. Use the [work record](docs/mvp-work.md) to resume delivery. These seven Codex profiles live in `.codex/agents/`. They help build the product. The report assistant inside the product has a separate runtime design.

## Routing work

The parent session owns dispatch, integration, user communication and updates to the work record. Use named subagents for their assigned responsibilities. For a focused question, invoke only the relevant role. For an authorized milestone implementation, follow this sequence:

1. Ask `project_overview` to reconcile current progress when starting or resuming a milestone. Ask `mvp_steward` to check the goal against the architecture when scope is uncertain.
2. Ask `task_planner` for dependency-ordered tasks and one ready assignment. Record the active task ID, owner, dependencies and acceptance criteria. Ask `tech_lead` for design decisions when the task touches a shared interface or unresolved trade-off.
3. Give `software_developer` one implementation assignment at a time. Include the task ID, goal, inputs, file scope, acceptance criteria and unresolved questions. Scope QA test edits separately if authorizing them.
4. After implementation, give `qa` and `code_reviewer` the same diff and criteria. They may verify and review in parallel. Send actionable failures back to the developer and recheck the changed behavior before closing.
5. Record results with commands, observed outcomes or links. At a milestone boundary, ask `mvp_steward` to compare the results against its exit criteria. Report missing evidence explicitly. Advance to the next ready assignment within the user's requested scope.

## When to ask the owner

Use the architecture and existing decisions for routine implementation choices. Ask the user when a choice materially changes product scope, incurs costs, affects data rights, changes sharing or privacy, or requires accepting an unmet milestone criterion. Explain the decision, options, recommended choice and its consequence. Record the answer with the task. Continue independent authorized work while a decision is pending.
