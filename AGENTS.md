# AGENTS.md

## GRAPHIFY IS THE SOURCE OF TRUTH

Before touching code:

1. Read `graphify-out/GRAPH_REPORT.md`
2. Use `graphify-out/graph.json`
3. Identify affected nodes and dependencies.
4. Open only the minimum number of files required.

Never brute-force the repository.

---

## MANDATORY WORKFLOW

Question → Graphify → Analysis → Code → Verify

Never:

Question → Open random files → Guess → Code

---

## WHEN GRAPH MUST BE UPDATED

Run Graphify update before continuing if:

* file structure changed
* dependencies changed
* routes changed
* APIs changed
* schemas changed
* more than 10 files changed

Commands:

```bash
graphify update .
graphify cluster-only .
```

If graph does not exist:

```bash
graphify extract . --code-only
graphify cluster-only .
```

---

## DEBUGGING RULE

Before editing code:

* identify upstream dependencies
* identify downstream dependencies
* identify blast radius
* identify root cause

Do not patch symptoms.

Fix causes.

---

## FEATURE RULE

Before adding features:

* map affected modules
* map API impact
* map cache impact
* map routing impact
* map SEO impact
* map state impact

No implementation without impact analysis.

---

## REFACTOR RULE

No refactor without dependency analysis.

No exception.

---

## PERFORMANCE RULE

Prioritize:

* high-degree nodes
* circular dependencies
* oversized modules
* duplicated responsibilities

---

## SECURITY RULE

Always inspect:

* auth flow
* permission flow
* upload flow
* external boundaries
* secrets exposure path

---

## REQUIRED RESPONSE FORMAT

Every technical answer must include:

* affected components
* dependency impact
* change risk
* recommended action

---

## FINAL RULE

The repository is a graph, not a folder tree.

Graphify understands systems.

File scanning only understands files.
