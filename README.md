# Roest 📦

A lightweight, language-agnostic CLI tool to analyze package freshness across different programming languages and package managers. Roest - meaning "Rust" in Dutch - helps you identify outdated packages by checking when they were last updated, making it easier to keep your dependencies current and secure.

## Usage

### Basic Usage

Navigate to your project directory and run:

```bash
npx roest check
```

This will automatically detect and analyze your project's lock files and display package update information.

#### npm (package-lock.json)

For Node.js projects using `npm`:

```bash
# Install dependencies
npm install

# Run roest
npx roest check
```

#### yarn (yarn.lock)

For JS projects using `yarn`:

```bash
# Install dependencies
yarn install

# Run roest
npx roest check
```

#### bun (bun.lock)

For JS projects using `bun`:

```bash
# Install dependencies
bun install

# Run roest
npx roest check
```

#### pip (requirements.txt)

For Python projects using `pip` and `requirements.txt`:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages from requirements.txt
pip install -r requirements.txt

# Run roest
npx roest check
```

#### conda (environment.yml)

WIP

### Command Options

- `-f, --file <path>`: Path to your lock file (default: auto-detected)
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

## Supported Package Managers

### Currently Supported ✅
- **npm** (package-lock.json v2 & v3)
- **yarn** (yarn.lock)
- **bun** (bun.lock)
- **pip** (requirements.txt)

### Work in Progress 🚧
- **pnpm** (pnpm-lock.yaml)
- **C#** (.NET packages)
- **Python** (additional package managers: poetry, pipenv, conda)

### Future Plans 🔮
- **Rust** (Cargo.toml)
- **Go** (go.mod)
- **Ruby** (Gemfile.lock)
- **PHP** (composer.lock)
- **Java** (Maven, Gradle)

## Development

### Prerequisites

Make sure you have [Bun](https://bun.sh) installed on your system.

### Install Dependencies

```bash
bun install
```

## License

MIT License - see LICENSE file for details.