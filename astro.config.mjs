// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkMacroHover } from './src/lib/remark-macro-hover.js';
import { rehypeMacroHover } from './src/lib/rehype-macro-hover.js';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'RPM Documentation',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/mado/rpm-docs' }
			],
			logo: {
				src: './src/assets/houston.webp',
			},
			customCss: [
				'./src/styles/rpm-syntax.css',
			],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Getting Started', slug: 'guides/getting-started' },
						{ label: 'Creating Packages', slug: 'guides/creating-packages' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Macros', slug: 'reference/macros' },
						{ label: 'Macro Syntax', slug: 'reference/macro-syntax' },
						{ label: 'Expressions', slug: 'reference/expressions' },
						{ label: 'Sections', slug: 'reference/sections' },
					],
				},
			],
			expressiveCode: {
				themes: ['catppuccin-mocha', 'github-dark'],
				styleOverrides: {
					borderRadius: '0.5rem',
					borderColor: '#45475a',
					codeFontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
				},
			},
		}),
	],
	markdown: {
		remarkPlugins: [remarkMacroHover],
		rehypePlugins: [rehypeMacroHover],
	},
});
