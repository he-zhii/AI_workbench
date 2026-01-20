import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Robustly polyfill process.env.API_KEY for usage in client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevent other process.env access from crashing the app
      'process.env': {}
    },
    // Ensure properly resolving of imports
    resolve: {
      alias: {
        // Fix for some packages that might rely on node util
        'util': 'util/'
      }
    },
    server: {
      host: '0.0.0.0',
      port: 8088
    }
  };
});