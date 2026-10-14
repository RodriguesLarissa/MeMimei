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
    // Busca dados via HttpClient (nosso backend) logo no carregamento — sem uma origem
    // absoluta disponível durante o SSR, essas rotas são renderizadas só no navegador.
    path: 'e/:slug',
    renderMode: RenderMode.Client,
  },
  {
    path: 'painel',
    renderMode: RenderMode.Client,
  },
  {
    path: 'painel/eventos/novo',
    renderMode: RenderMode.Client,
  },
  {
    path: 'painel/eventos/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'painel/eventos/:id/contribuicoes',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
