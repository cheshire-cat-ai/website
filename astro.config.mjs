// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://cheshirecat.ai',
    trailingSlash: 'always',
    integrations: [mdx(), sitemap(), react()],
});