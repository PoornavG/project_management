import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/students': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/students/, '/students') // Optional rewrite
      },
      '/faculty': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/faculty/, '/faculty') // Optional rewrite
      },
      '/faculty_technologies': {
        target: 'http://127.0.0.1:8080', // Replace with your Flask backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/faculty_technologies/, '/faculty_technologies')
      },
      '/student_technologies': {
        target: 'http://127.0.0.1:8080', // Replace with your Flask backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/student_technologies/, '/student_technologies')
      },
      '/users': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/users/, '/users') // Optional rewrite
      },
      '/departments': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/departments/, '/departments') // Optional rewrite
      },
      '/technologies': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/technologies/, '/technologies') // Optional rewrite
      },
    }
  }
});
