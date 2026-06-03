# Contributing to AI Powered Supply Chain & Sales Automation Platform

Thank you for considering contributing to this project. This document outlines the process for contributing code, reporting issues, and proposing improvements.

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and constructive environment. All contributors are expected to adhere to professional standards of communication.

---

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/Avi6855/AI-Powered-Supply-Chain-Sales-Automation/issues) to ensure it has not been reported already.
2. Open a new issue with the following information:
   - **Environment**: OS, Node.js version, Java version, browser
   - **Steps to reproduce**: Exact steps to trigger the issue
   - **Expected behavior**: What you expected to happen
   - **Actual behavior**: What actually happened
   - **Screenshots**: If applicable

### Proposing Features

1. Open a [feature request issue](https://github.com/Avi6855/AI-Powered-Supply-Chain-Sales-Automation/issues/new) with the label `enhancement`.
2. Describe the business problem it solves and the proposed solution.
3. Wait for feedback before investing time in implementation.

---

## Development Workflow

### 1. Fork & Clone

```bash
git clone https://github.com/Avi6855/AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform.git
cd AI_Powered_Smart_Supply_Chain_-_Sales_Automation_Platform
```

### 2. Create a Feature Branch

Use a descriptive branch name:

```bash
git checkout -b feature/inventory-export-csv
git checkout -b fix/dashboard-chart-cumulative
git checkout -b docs/update-api-reference
```

### 3. Set Up the Development Environment

Follow the [Installation Guide](README.md#installation) in the README.

### 4. Make Your Changes

- Write clean, readable TypeScript/Java code
- Follow existing code conventions and naming patterns
- Add comments for non-obvious logic
- Do not introduce new dependencies without discussion

### 5. Test Your Changes

```bash
# Frontend
cd frontend && npm run lint
cd frontend && npm test

# Backend
cd backend && mvn test
```

### 6. Commit Your Changes

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add CSV export for inventory module
fix: correct cumulative revenue chart calculation
docs: update API endpoint documentation
refactor: extract PO form into reusable component
test: add unit tests for order status transitions
```

### 7. Push and Open a Pull Request

```bash
git push origin feature/your-feature-name
```

Open a pull request against the `main` branch. Include:
- What change was made and why
- Screenshots for UI changes
- Any relevant issue numbers (`Closes #123`)

---

## Code Standards

### Frontend (TypeScript / Next.js)

- Use `TypeScript` with strict type checking — avoid `any` unless unavoidable
- Use functional components with hooks
- Keep components focused and under 300 lines
- Extract reusable logic into custom hooks under `/src/hooks`
- Use Zod schemas for all form validation

### Backend (Java / Spring Boot)

- Follow the existing package structure (`controller → service → repository`)
- Use DTOs for all API request/response objects
- Annotate all controller endpoints with Swagger `@Operation` and `@ApiResponse`
- Write unit tests for service layer logic
- Use Lombok `@Slf4j` for logging

---

## Environment Variables

**Never commit secrets.** Copy `.env.example` and populate locally:

```bash
cp frontend/.env.example frontend/.env.local
```

Do not expose `OPENROUTER_API_KEY` or any real API credentials in code, comments, or commits.

---

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).
