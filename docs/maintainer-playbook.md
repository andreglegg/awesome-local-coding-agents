# Maintainer playbook

## Before merging

- Read SPEC.md and CONTRIBUTING.md, inspect all changed files and first-party evidence.
- Check upstream activity and whether its CLI can operate on a codebase with local inference.
- Confirm README is generated from data/agents.json and `npm run check` passes in CI.
- Keep performance unverified without independently reviewed T0 + T2 + (T1 or T3) result records.
- Preserve original contributor-authored commits and credit when integrating a conflicting PR; use a merge commit instead of squash when necessary.
- Do not merge code executing untrusted agent/model output in GitHub's privileged CI; benchmark runners should use isolated disposable systems.

## Branch protection on main

The active [Protect main ruleset](https://github.com/andreglegg/awesome-local-coding-agents/rules/27968796) applies to the default branch, `main`. It requires a pull request and the GitHub Actions `validate` check, blocks force pushes and branch deletion, and has no bypass actors. The ruleset does not require an approving review, resolved conversations, or an up-to-date base. Still review substantive changes and revalidate if the base changes could affect them.

If the ruleset is missing or disabled, pause merges. The repository owner can restore it under **Settings → Rules → Rulesets**. Apply it to `main`, require pull requests and the GitHub Actions `validate` check, block force pushes and deletion, and leave the bypass list empty. Verify that the check reports from GitHub Actions; if a fork run is pending approval, follow GitHub's approval process and wait for the check to pass.

## Scheduled checks

The [freshness workflow](../.github/workflows/freshness.yml) checks archived upstreams and evidence URLs weekly. HTTP rate limiting or inaccessible hosts produce inconclusive diagnostics rather than automatic deletion. Human review is required before removing agents.

## Releases

Use versioned and immutable benchmark task acceptance criteria. Corrections to a benchmark should create a new task version rather than silently rewriting old results.
