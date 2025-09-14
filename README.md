# Roest 📦

A lightweight CLI tool to analyze package freshness in your Node.js or Web projects. Roest - meaning "Rust" in Dutch - helps you identify outdated packages by checking when they were last updated, making it easier to keep your dependencies current and secure.

## Usage

### Basic Usage

Navigate to your project directory and run:

```bash
npx roest check
```

This will analyze your `package-lock.json` file and display package update information.

### Analyze GitHub Repository

You can also analyze any GitHub repository directly. In order to do this, you need to make sure you have the `GITHUB_TOKEN` environment variable set. You can create a new GitHub token [here](https://github.com/settings/personal-access-tokens).

Once you have your token, run the following command:

```bash
npx roest repo owner/repository
```

This will find and analyze all lock files in the specified GitHub repository.

### Command Options

#### `check` command
- `-f, --file <path>`: Path to your lock file (default: auto-detect in current directory)
- `-o, --output <path>`: Output file path for JSON results (default: `./output.json`)

#### `repo` command
- `-o, --output <path>`: Output file path for JSON results (default: `./output.json`)

## Output Format

### JSON Output

The tool also generates a detailed JSON file containing:

```json
[
  {
    "name": "chalk",
    "current": {
      "version": "5.6.2",
      "publishDate": "2024-01-15T10:30:00.000Z"
    },
    "next": {
      "version": "5.6.3",
      "publishDate": "2024-03-01T14:20:00.000Z"
    }
  }
]
```

## Supported Lock File Formats

- **npm package-lock.json v2**: Full support
- **npm package-lock.json v3**: Full support
- **pnpm**: Planned
- **bun**: Planned
- **yarn**: Planned

## Development

### Prerequisites

Make sure you have [Bun](https://bun.sh) installed on your system.

### Install Dependencies

```bash
bun install
```

## License

MIT License - see LICENSE file for details.