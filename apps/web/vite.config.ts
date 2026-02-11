import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
            manifest: {
                name: 'Your Chaos, My Mission',
                short_name: 'YCMM',
                description: 'Dein Chaos, meine Mission - Die All-in-One App für dein Leben',
                theme_color: '#228be6',
                background_color: '#1a1b1e',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
                categories: ['productivity', 'lifestyle', 'utilities'],
                shortcuts: [
                    {
                        name: 'Dashboard',
                        short_name: 'Dashboard',
                        url: '/app',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                    {
                        name: 'Habits',
                        short_name: 'Habits',
                        url: '/app/habits',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // Import push notification handler
                importScripts: ['/push-sw.js'],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://api:8080',
                changeOrigin: true,
            },
        },
    },
});
