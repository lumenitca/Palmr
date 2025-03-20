// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';


export default defineConfig({
	integrations: [
		starlight({
			title: '🌴 Palmr. Docs',
			defaultLocale: 'root',
			social: {
				github: 'https://github.com/kyantech/Palmr',
				openCollective: 'https://github.com/sponsors/kyantech',
			},
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'Welcome to Palmr.', link: '/' },
						{ label: 'Architecture of Palmr.', link: '/core/architecture' },
						{ label: 'GitHub architecture', link: '/core/github-architecture' },
						{ label: 'Installation (Docker Compose)', link: '/core/installation' },
						{ label: 'Manual installation', link: '/core/manual-installation' },
						{ label: 'API Endpoints', link: '/core/api-docs' },
					],
				},
				{
					label: 'How to use Palmr.',
					items: [
						{ label: 'First login (Admin)', link: '/main/login' },
						// { label: 'Adding users', link: '/' },
						// { label: 'Password reset', link: '/' },
						// { label: 'Uploading a file', link: '/' },
						// { label: 'Editing an upload', link: '/' },
						// { label: 'Creating a share', link: '/' },
						// { label: 'Generate a share link', link: '/' },
						{ label: 'Available languages', link: '/main/available-languages' },
					],
				},
				{
					label: 'Developers',
					items: [
						{ label: 'How to open an issue', link: '/' },
						{ label: 'How to contribute', link: '/' },
					],
				},
				{
					label: 'Sponsor this project',
					items: [
						{ label: 'Github Sponsors', link: '/' },
						{ label: 'Star this project on Github', link: '/' },
					],
				},
			],
			lastUpdated: true,
			pagination: false,
			customCss: [
				'./src/styles/custom.css',
			],
		}),
	],
});
