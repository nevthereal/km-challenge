import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), devtoolsJson()],
	optimizeDeps: {
		include: ['@lucide/svelte']
	},
	ssr: {
		noExternal: ['@lucide/svelte']
	}
});
