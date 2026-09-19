# Rule: Agent Behavior

- Plan first for any non-trivial feature. Show the plan to the user before
  implementing. Trivial fixes/tweaks don't need a plan.
- Do not treat "code generated" as "feature completed." A feature is done
  only when it meets the Definition of Done in `build-plan.md`.
- Do not modify architecture, the data model, or add a major dependency
  without explicit user approval. Small utility packages (e.g. a date
  formatter) don't require approval.
- Do not guess undocumented library behavior. Check the docs or search the
  web before deciding.
- Do not rewrite unrelated code while implementing a feature.
- Do not mark unfinished or unverified work as complete in
  `progress-tracker.md`.
- Verify your own work only when asked — otherwise state clearly what still
  needs checking.
- Update `progress-tracker.md` after each feature. Log meaningful decisions
  in `decisions.md`.
- When uncertain about a requirement, and it materially affects
  architecture, UX, or correctness — ask the user rather than assuming.
