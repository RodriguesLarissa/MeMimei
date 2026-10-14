import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'termos',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'privacidade',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'e/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
