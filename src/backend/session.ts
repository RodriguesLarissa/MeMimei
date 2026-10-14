import session from 'express-session';
import { backendEnv } from './env';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    email?: string;
    displayName?: string;
  }
}

export const sessionMiddleware = session({
  secret: backendEnv.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dias
  },
});
