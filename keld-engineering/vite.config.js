import { defineConfig } from 'vite';
import { resolve } from 'path';
import glob from 'glob';
import handlebars from 'vite-plugin-handlebars';
import createExternal from 'vite-plugin-external';
import externalGlobals from 'rollup-plugin-external-globals';
import sassGlobImports from 'vite-plugin-sass-glob-import';
import watchAndRun from 'vite-plugin-watch-and-run';
import filterReplace from 'vite-plugin-filter-replace';
import { directoryPlugin } from 'vite-plugin-list-directory-contents';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'build');
const allHtmlFiles = glob.sync(resolve(root, '.\/*.html').replace(/\\/g, '/'));
const htmlFilesToBuild = allHtmlFiles.filter(file => !file.includes('index.html')); // Excludes index.html from the build array so we don't build an emtpy index.

export default defineConfig({
	base: '',
	root,
	server: {
		open: '/',
	},
	build: {
		outDir,
		rollupOptions: {
			input: htmlFilesToBuild,
			output: {
				assetFileNames: (assetInfo) => {
					const extType = assetInfo.name.split('.').pop();
					const isCSS = extType == 'css';

					if (!isCSS) {
						return `assets/[name].[ext]`;
					}

					return `assets/style.[ext]`;
				},
				entryFileNames: 'assets/app.js',
				chunkFileNames: 'assets/app.js',
			},
		},
		emptyOutDir: true,
		minify: false,
	},
	plugins: [
		directoryPlugin({
			baseDir: root,
		}),
		handlebars({
			partialDirectory: resolve(root, 'partials'),
		}),
		filterReplace.default([
			{
				filter: /select2\/dist\/.+\.js$/,
				replace: {
					from: 'exports',
					to: 'undefined',
				},
			},
			{
				filter: /selectric\/public\/.+\.js$/,
				replace: {
					from: 'exports',
					to: 'undefined',
				},
			},
			{
				filter: /malihu-custom-scrollbar-plugin\/.+\.js$/,
				replace: {
					from: 'exports',
					to: 'undefined',
				},
			},
		]),
		externalGlobals({
			jquery: 'jQuery',
		}, {
			include: ['*.js', '*.ts', '*.jsx', '*.tsx', '*.vue'],
		}),
		createExternal({
			externals: {
				jquery: 'jQuery',
			},
		}),
		sassGlobImports(),
		watchAndRun([
			{
				watch: '**/scss/**/*.scss',
				watchKind: 'add',
				run: 'touch ./src/scss/style.scss',
				quiet: true,
			}
		]),
	],
});
