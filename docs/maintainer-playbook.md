# Maintainer playbook

## Before merging

- Read SPEC.md and CONTRIBUTING.md, inspect all changed files and first-party evidence.
- Check upstream activity and whether its CLI can operate on a codebase with local inference.
- Confirm README is generated from data/agents.json and `npm run check` passes in CI.
- Keep performance unverified without independently reviewed T0 + T2 + (T1 or T3) result records.
- Preserve original contributor-authored commits and credit when integrating a conflicting PR; use a merge commit instead of squash when necessary.
- Do not merge code executing untrusted agent/model output in GitHub's privileged CI; benchmark runners should use isolated disposable systems.

## GitHub settings that require repository administration

The connected GitHub integration can read branch/ruleset settings but cannot create or enforce branch-protection rules. **The repository owner should set these once**:

1. GitHub repository **Settings → Rules → Rulesets → New branch ruleset** for `main`.
2. Require pull requests, passing GitHub Actions **validate** status, and block force pushes and deletion.
3. Keep administrator emergency access only where needed, and enable discussion/review for higher-risk changes.
4. Consider enforcing CODEOWNERS reviews for workflows, validation, evaluators, release configuration and project governance.

Avoid requiring an unregistered check name until the first successful run reveals the exact status name. Verify external forks can run the required check before enforcing it.

## Scheduled checks

The [freshness workflow](../.github/workflows/freshness.yml) checks archived upstreams and evidence URLs weekly. HTTP rate limiting or inaccessible hosts produce inconclusive diagnostics rather than automatic deletion. Human review is required before removing agents.

## Releases

Use versioned and immutable benchmark task acceptance criteria. Corrections to a benchmark should create a new task version rather than silently rewriting old results.
