# Contributing to Navium

Thanks for your interest in contributing to Navium. This document outlines the basic workflow for contributing to the project.

## Code of Conduct

Please be respectful and professional in all interactions. Be kind to other contributors and maintain a clear, constructive tone in discussions and pull requests.

## Getting Started

1. Fork the repository.
2. Clone your fork locally.
3. Install dependencies:
   ```bash
   bun install
   ```
4. Create a local environment file:
   ```bash
   cp .env.example .env
   ```
5. Configure the required environment variables in `.env`.
6. Start the development server:
   ```bash
   bun dev
   ```

## Development Guidelines

- Follow the existing project structure and naming conventions.
- Keep code clean, readable, and typed where possible.
- Use meaningful commit messages.
- Avoid introducing unnecessary dependencies.
- Keep changes focused on a single concern.

## Pull Request Guidelines

- Create a feature branch from `main` or `master`.
- Make sure your changes are tested or verified where possible.
- Open a pull request with a clear title and description.
- Include screenshots or notes for UI changes when relevant.

## Database Changes

If you change Prisma models, run:

```bash
bunx prisma migrate dev
bunx prisma generate
```

## Questions

If you have questions or want help getting started, open an issue or start a discussion.
