---
description: 
---

Create or refactor an AGENTS.md file following the exact specified FORMAT.

Requirements:
- If AGENTS.md does not exist, generate it from scratch.
- If it exists, intelligently refactor and optimize it without losing critical information.
- Ensure the output is concise, structured, and high-signal (no fluff).
- Prioritize clarity, consistency, and performance for downstream AI usage.
- Use precise language and enforce strict adherence to the FORMAT.
- Eliminate redundancy, ambiguity, and unnecessary verbosity.
- Ensure sections are complete, logically ordered, and easy to parse.

Output Rules:
- Return only the final AGENTS.md content.
- Do not include explanations, comments, or meta-text.
- Ensure formatting is clean and production-ready.

FORMAT:
`# Project Name

Brief description of the project and its purpose.

## Code Style

- Use TypeScript for all new files
- Follow ESLint configuration
- Use 2 spaces for indentation

## Architecture

- Follow MVC pattern
- Keep components under 200 lines
- Use dependency injection

## Testing

- Write unit tests for all business logic
- Maintain >80% code coverage
- Use Jest for testing

## Security

- Never commit API keys or secrets
- Validate all user inputs
- Use parameterized queries for database access
`