import { defineConfig } from 'vite';

// - base './' : chemins relatifs → fonctionne aussi bien en local que sur
//   https://<pseudo>.github.io/chess-master-academy/ (Stockfish et son .wasm compris).
// - JSX compilé par esbuild (rapide, aucune dépendance à Babel).
export default defineConfig({
  base: './',
  esbuild: { jsx: 'automatic' },
  server: { port: 5188 },
  build: { chunkSizeWarningLimit: 900 },
});
