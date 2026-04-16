# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within ConvergentCode, please send an email to the maintainer via [GitHub Issues](https://github.com/sagelyone/ConvergentCode/issues). All security vulnerabilities will be promptly addressed.

Please do not report security vulnerabilities through public GitHub issues.

## Security Best Practices

When using ConvergentCode:

- Always review code changes before accepting them
- Keep your dependencies up to date
- Use the escape protocol to prevent runaway agents
- Never commit sensitive credentials to your repository
- Use the immutable ground truth feature to prevent specification drift

## Security Features

ConvergentCode includes several security features:

- **Agent Permissions**: Fine-grained control over what agents can access
- **Escape Protocol**: Automatic escalation when agents get stuck
- **Ground Truth Immutability**: Sealed specifications prevent tampering
- **Minimal Scope**: Constraints on code changes limit blast radius
