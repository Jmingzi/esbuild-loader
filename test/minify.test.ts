import webpack4 from 'webpack';
import webpack5 from 'webpack5';
import {build, getFile} from './utils';
import {ESBuildMinifyPlugin} from '..';
import * as fixtures from './fixtures';

describe.each([
	['Webpack 4', webpack4],
	['Webpack 5', webpack5],
])('%s Loader + Minification', (_name, webpack) => {
	test('minify', async () => {
		const statsUnminified = await build(webpack, fixtures.js);

		const stats = await build(webpack, fixtures.js, config => {
			config.optimization = {
				minimize: true,
				minimizer: [new ESBuildMinifyPlugin()],
			};
		});

		expect(statsUnminified.hash).not.toBe(stats.hash);
		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
	});

	test('minifyWhitespace', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			config.optimization = {
				minimize: true,
				minimizer: [
					new ESBuildMinifyPlugin({
						minifyWhitespace: true,
					}),
				],
			};
		});

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
	});

	test('minifyIdentifiers', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			config.optimization = {
				minimize: true,
				minimizer: [
					new ESBuildMinifyPlugin({
						minifyIdentifiers: true,
					}),
				],
			};
		});

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
	});

	test('minifySyntax', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			config.optimization = {
				minimize: true,
				minimizer: [
					new ESBuildMinifyPlugin({
						minifySyntax: true,
					}),
				],
			};
		});

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
	});

	test('minify chunks', async () => {
		const stats = await build(webpack, fixtures.webpackChunks, config => {
			config.optimization = {
				minimize: true,
				minimizer: [new ESBuildMinifyPlugin()],
			};
		});

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
		expect(getFile(stats, '/dist/named-chunk-foo.js')).toMatchSnapshot();
		expect(getFile(stats, '/dist/named-chunk-bar.js')).toMatchSnapshot();
	});

	test('minify chunks filtered using "include"', async () => {
		const stats = await build(webpack, fixtures.webpackChunks, config => {
			config.optimization = {
				minimize: true,
				minimizer: [new ESBuildMinifyPlugin({
					include: /(index|bar)/,
				})],
			};
		});

		// The string "__webpack_require__" is only present in unminified chunks
		expect(getFile(stats, '/dist/index.js')).not.toContain('__webpack_require__');
		expect(getFile(stats, '/dist/named-chunk-foo.js')).toContain('__webpack_require__');
		expect(getFile(stats, '/dist/named-chunk-bar.js')).not.toContain('__webpack_require__');

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
		expect(getFile(stats, '/dist/named-chunk-foo.js')).toMatchSnapshot();
		expect(getFile(stats, '/dist/named-chunk-bar.js')).toMatchSnapshot();
	});

	test('minify chunks filtered using "exclude"', async () => {
		const stats = await build(webpack, fixtures.webpackChunks, config => {
			config.optimization = {
				minimize: true,
				minimizer: [new ESBuildMinifyPlugin({
					exclude: /bar/,
				})],
			};
		});

		// The string "__webpack_require__" is only present in unminified chunks
		expect(getFile(stats, '/dist/index.js')).not.toContain('__webpack_require__');
		expect(getFile(stats, '/dist/named-chunk-foo.js')).not.toContain('__webpack_require__');
		expect(getFile(stats, '/dist/named-chunk-bar.js')).toContain('__webpack_require__');

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
		expect(getFile(stats, '/dist/named-chunk-foo.js')).toMatchSnapshot();
		expect(getFile(stats, '/dist/named-chunk-bar.js')).toMatchSnapshot();
	});

	test('minify w/ no devtool', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			delete config.devtool;
			config.optimization = {
				minimize: true,
				minimizer: [new ESBuildMinifyPlugin()],
			};
		});

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
	});

	test('minify w/ devtool inline-source-map', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			config.devtool = 'inline-source-map';
			config.optimization = {
				minimize: true,
				minimizer: [new ESBuildMinifyPlugin()],
			};
		});

		const contents = getFile(stats, '/dist/index.js');
		expect(contents).toContain('//# sourceMappingURL=data:application/');
		expect(contents).toMatchSnapshot();
	});

	test('minify w/ devtool source-maps', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			config.devtool = 'source-map';
			config.optimization = {
				minimize: true,
				minimizer: [new ESBuildMinifyPlugin()],
			};
		});

		const contents = getFile(stats, '/dist/index.js');
		expect(contents).toContain('//# sourceMappingURL=index.js.map');
		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
	});

	test('minify w/ sourcemap option', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			delete config.devtool;
			config.optimization = {
				minimize: true,
				minimizer: [
					new ESBuildMinifyPlugin({
						sourcemap: true,
					}),
				],
			};
		});

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
	});

	test('minify w/ sourcemap option and source-map plugin inline', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			delete config.devtool;
			config.optimization = {
				minimize: true,
				minimizer: [
					new ESBuildMinifyPlugin({
						sourcemap: true,
					}),
				],
			};

			// @ts-expect-error
			config.plugins.push(new webpack.SourceMapDevToolPlugin({}));
		});

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
	});

	test('minify w/ sourcemap option and source-map plugin external', async () => {
		const stats = await build(webpack, fixtures.js, config => {
			delete config.devtool;
			config.optimization = {
				minimize: true,
				minimizer: [
					new ESBuildMinifyPlugin({
						sourcemap: true,
					}),
				],
			};

			config.plugins.push(
				// @ts-expect-error
				new webpack.SourceMapDevToolPlugin({
					filename: 'index.js.map',
				}),
			);
		});

		expect(getFile(stats, '/dist/index.js')).toMatchSnapshot();
		expect(getFile(stats, '/dist/index.js.map')).toMatchSnapshot();
	});
});

test('Webpack 5 stats', async () => {
	const stats = await build(webpack5, fixtures.js, config => {
		config.optimization = {
			minimize: true,
			minimizer: [new ESBuildMinifyPlugin()],
		};
	});

	expect(stats.toString().includes('[minimized]')).toBe(true);
});
