
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  assets: {
    'index.csr.html': {size: 488, hash: '7eb396894d7401a0a5a75f96f87619d44fa3c4d741a77a0790c17d206985cde0', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1001, hash: '253fea6a99c29e55fb6721bf06c48d07a95462059bb0ea71335c3d49ac377c29', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 20824, hash: 'a803bacb865b4dac33fa70578a0c74ac0ea5fb729be4d4c1c97f9ad3f8c6244f', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
