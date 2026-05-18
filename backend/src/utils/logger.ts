const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const timestamp = () => {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
};

export const logger = {
  info: (module: string, message: string, data?: unknown) => {
    console.log(`${colors.cyan}[${timestamp()}]${colors.reset} ${colors.green}[INFO]${colors.reset} [${module}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`);
  },
  warn: (module: string, message: string, data?: unknown) => {
    console.warn(`${colors.cyan}[${timestamp()}]${colors.reset} ${colors.yellow}[WARN]${colors.reset} [${module}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`);
  },
  error: (module: string, message: string, error?: unknown) => {
    console.error(`${colors.cyan}[${timestamp()}]${colors.reset} ${colors.red}[ERROR]${colors.reset} [${module}] ${message}${error ? ' ' + (error instanceof Error ? error.stack || error.message : JSON.stringify(error)) : ''}`);
  },
};
