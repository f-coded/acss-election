import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
        dashboard: 'dashboard.html',
        signup: 'signup.html',
        voting: 'voting.html',
        welcome: 'welcome.html'
      }
    }
  }
});


