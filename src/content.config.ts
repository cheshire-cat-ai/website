import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			author: z.string(),
			categories: z.array(z.string()),
			tags: z.array(z.string()).optional(),
		}),
});

const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			heroImage: image().optional(),
		}),
});

const authors = defineCollection({
	loader: glob({ base: './src/content/authors', pattern: '**/*.json' }),
	schema: z.object({
		name: z.string(),
		bio: z.string().nullable().optional(),
		avatar: z.string().nullable().optional(),
		links: z.array(z.object({
			label: z.string(),
			url: z.string(),
		})).optional(),
	}),
});

export const collections = { blog, pages, authors };
