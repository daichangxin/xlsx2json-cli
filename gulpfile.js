const gulp = require('gulp');
const rollup = require('rollup');
const node_resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const commonjs = require('rollup-plugin-commonjs');
const buildins = require('rollup-plugin-node-builtins');

gulp.task('build', async () => {
    return rollup.rollup({
        input: './src/index.ts',
        treeshake: true,
        plugins: [
            buildins(),
            node_resolve(),
            commonjs({
                exclude: 'node_modules/**',
            }),
            typescript({
                check: false,
                tsconfigOverride: {
                    compilerOptions: {
                        removeComments: true
                    },
                },
                include: /.*(.ts)$/
            }),
        ],
        onwarn: function (warning) {
            if (warning.code === 'THIS_IS_UNDEFINED') {
                return;
            }
            console.warn(warning.message);
        }
    }).then(bundle => {
        return bundle.write({
            file: './bin/index.js',
            banner: "#!/usr/bin/env node",
            format: 'iife',
            name: 'paw',
        })
    });
});

gulp.task('watch', () => {
    gulp.watch('./src/**/*.ts', gulp.series(['build']));
});

gulp.task('default', gulp.series(['build', 'watch']));