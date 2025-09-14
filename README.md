# Roest 📦

A lightweight CLI tool to analyze package freshness in your Node.js or Web projects. Roest - meaning "Rust" in Dutch - helps you identify outdated packages by checking when they were last updated, making it easier to keep your dependencies current and secure.

## Usage

### Basic Usage

Navigate to your project directory and run:

```bash
npx roest check
```

This will analyze your `package-lock.json` file and display package update information.

### Command Options

- `-f, --file <path>`: Path to your package-lock.json file (default: `./package-lock.json`)
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