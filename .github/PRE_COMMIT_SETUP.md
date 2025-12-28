# Pre-commit Hooks Setup

This project uses pre-commit hooks to maintain code quality and security.

## Installation

### 1. Install pre-commit

```bash
# Using pip
pip install pre-commit

# Or using homebrew (macOS)
brew install pre-commit

# Or using apt (Ubuntu/Debian)
sudo apt install pre-commit
```

### 2. Install the git hooks

```bash
# In the project root directory
pre-commit install
```

## What Gets Checked

### Security
- **Gitleaks**: Scans for secrets, API keys, passwords in commits
- **Detect Private Keys**: Prevents committing SSH private keys
- **Check .env files**: Prevents committing environment files

### Code Quality
- **Trailing whitespace**: Removes trailing spaces
- **End of file fixer**: Ensures files end with newline
- **Mixed line endings**: Converts to LF (Unix style)
- **Check case conflict**: Prevents case-sensitive filename conflicts

### File Validation
- **Check YAML**: Validates YAML syntax
- **Check JSON**: Validates JSON syntax
- **Check TOML**: Validates TOML syntax
- **Check merge conflicts**: Detects unresolved merge markers
- **Check large files**: Prevents files over 1MB

### Project-Specific
- **No commit to main**: Prevents direct commits to main branch
- **Backend tests**: Runs backend tests when backend files change
- **ESLint**: Lints TypeScript/JavaScript files

## Usage

### Normal Workflow

Pre-commit hooks run automatically on `git commit`:

```bash
git add .
git commit -m "Your commit message"
# Hooks run automatically
```

### Manual Run

Run hooks on all files:

```bash
pre-commit run --all-files
```

Run specific hook:

```bash
pre-commit run gitleaks --all-files
pre-commit run trailing-whitespace --all-files
```

### Skipping Hooks (Use Sparingly)

Only skip hooks when absolutely necessary:

```bash
git commit --no-verify -m "Emergency fix"
```

**Warning**: Skipping hooks bypasses security checks!

## Troubleshooting

### Hook fails with "command not found"

Make sure dependencies are installed:

```bash
# Backend tests
cd backend && npm install

# ESLint
npm install
```

### Gitleaks finds false positive

Add to `.gitleaks.toml`:

```toml
[allowlist]
paths = [
    '''path/to/file'''
]
```

### Update hooks to latest versions

```bash
pre-commit autoupdate
```

### Clear hook cache

```bash
pre-commit clean
pre-commit install --install-hooks
```

## Best Practices

1. **Never skip security hooks** (gitleaks, detect-private-key)
2. **Fix issues immediately** rather than skipping hooks
3. **Update hooks regularly** with `pre-commit autoupdate`
4. **Run hooks before pushing** with `pre-commit run --all-files`

## CI/CD Integration

To run pre-commit in CI/CD:

```yaml
# .github/workflows/pre-commit.yml
name: Pre-commit
on: [push, pull_request]
jobs:
  pre-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - uses: pre-commit/action@v3.0.0
```
