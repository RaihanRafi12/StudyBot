
# StudyBot Contributing Guidelines

## Code Style

- Use **TypeScript** for all new files — avoid plain `.js`
- Follow the existing ESLint and Prettier configuration
- Use meaningful, descriptive variable and function names
- Keep components small and focused — one responsibility per component
- Use `camelCase` for variables/functions, `PascalCase` for components and types

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level page components
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Helper functions and utilities
└── assets/         # Static assets (images, icons)
```

## Git Workflow

1. Always branch off `main`
2. Use descriptive branch names:
   - `feature/your-feature-name`
   - `fix/bug-description`
   - `chore/task-description`
3. Write clear commit messages: `Add resource upload validation`
4. Run `npm run build` before opening a PR — broken builds won't be merged

## Pull Request Rules

- Keep PRs focused — one feature or fix per PR
- Describe what changed and why in the PR description
- Reference related issues with `Closes #issue-number`
- Add screenshots or screen recordings for UI changes
- Request at least one review before merging

## Component Guidelines

- Use functional components with hooks — no class components
- Co-locate component styles using Tailwind utility classes
- Use `shadcn/ui` or `Radix UI` primitives before building custom components
- Ensure all interactive elements are keyboard accessible
- Test on mobile and desktop before submitting

## Role-Based Development

When adding features, consider all user roles:

| Role | Access Level |
|------|-------------|
| Visitor | Read-only, public resources |
| Student | Browse, save, earn points |
| Faculty | Upload, manage own content |
| Researcher | Upload research, advanced analytics |
| Admin | Full platform control |

Never expose admin-only features to non-admin roles.

## Testing

- Manually test your feature across all relevant user roles
- Test on at least one mobile viewport (375px) and desktop (1280px)
- Verify dark/light mode compatibility for new UI components
- Check that new uploads/actions reflect correctly in the admin activity log

## Reporting Issues

- Search existing issues before opening a new one
- Use the appropriate label: `bug`, `feature`, `question`, `documentation`
- For bugs, include: steps to reproduce, expected vs actual behavior, screenshots
- For features, prefix the title with `[FEATURE]` and explain the use case

## Code of Conduct

- Be respectful and constructive in reviews and discussions
- Focus feedback on the code, not the person
- Help newcomers get up to speed
- Keep discussions on-topic and professional

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->
