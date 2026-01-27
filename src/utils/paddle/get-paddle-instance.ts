import { Environment, LogLevel, Paddle, PaddleOptions } from '@paddle/paddle-node-sdk';

export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ?? Environment.sandbox,
    logLevel: LogLevel.error,
  };

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    console.error('Paddle API key is missing');
    throw new Error('Paddle API key is missing');
  }

  return new Paddle(apiKey, paddleOptions);
}
