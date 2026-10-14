import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { sessionMiddleware } from './backend/session';
import { authRouter } from './backend/routes/auth.routes';
import { publicEventsRouter } from './backend/routes/public-events.routes';
import { eventsRouter } from './backend/routes/events.routes';
import { giftsRouter } from './backend/routes/gifts.routes';
import { uploadsRouter } from './backend/routes/uploads.routes';
import { ownerContributionsRouter, publicContributionsRouter } from './backend/routes/contributions.routes';
import { webhooksRouter } from './backend/routes/webhooks.routes';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Atrás do proxy HTTPS do Render (ou similar) — necessário pro cookie de
// sessão "secure" funcionar corretamente em produção.
app.set('trust proxy', 1);

/**
 * API do MeMimei — único ponto de contato com o Supabase (o navegador nunca
 * fala com o Supabase diretamente).
 */
app.use(express.json());
app.use(sessionMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/public/events', publicEventsRouter);
app.use('/api/public/contributions', publicContributionsRouter);
app.use('/api/events', eventsRouter);
app.use('/api', giftsRouter);
app.use('/api', ownerContributionsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/webhooks', webhooksRouter);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
