# Use Tapio and Dupin

## Tapio

Tapio is the platform guide. Ask Tapio questions about how Igdrsil works, where to find a feature, or which agent to use.

Examples:

- "How do I create a Project?"
- "What is a Corpus Source?"
- "Which agent should check citations?"

Tapio answers from the documentation. If the answer is not in the documentation, Tapio should say so instead of guessing.

## Dupin

Dupin is the document agent for citation checking. It reads an uploaded document, extracts legal citations, and checks them against the Corpus Sources attached to the Project.

## Run a Dupin check

1. Open the relevant Project.
2. Create or open a Task for the document review.
3. Attach the document to the Task.
4. Make sure Dupin is available in the Task.
5. Ask Dupin to run a citation review.
6. Wait for the structured report.

## Read a Dupin report

Dupin returns one row per citation with a verdict:

- **EXISTS**: the cited source appears to be present and consistent with the citation.
- **NOT_FOUND**: Dupin could not find the cited source in the available Corpus Sources.
- **UNCERTAIN**: Dupin found a possible match, but the match is weak or incomplete.

Review **UNCERTAIN** first, then **NOT_FOUND**, then important **EXISTS** rows. Dupin helps you focus attention; it does not replace professional judgement.
