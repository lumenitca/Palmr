import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Palmr Documentation',
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
            { label: 'Manage users', link: '/main/manage-users' }, 
            { label: 'Uploading files', link: '/main/upload' }, 
            // { label: 'Creating a share', link: '/' }, // !TODO
            // { label: 'Password reset', link: '/' }, // !TODO
            { label: 'Available languages', link: '/main/available-languages' },
          ],
        },
        {
          label: 'Developers',
          items: [
            { label: 'How to contribute', link: '/developers/contribute' },
            { label: 'How to open an issue', link: '/developers/open-an-issue' },
          ],
        },
        {
          label: 'Sponsor this project',
          items: [
            { label: 'Star this project on Github', link: '/sponsor/gh-star' },
            { label: 'Github Sponsors', link: '/sponsor/gh-sponsor' },
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
