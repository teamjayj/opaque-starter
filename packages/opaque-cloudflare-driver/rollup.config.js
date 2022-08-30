// rollup.config.js
import ts from 'rollup-plugin-ts';
import del from 'rollup-plugin-delete';

const config = [
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist',
            format: 'es',
            sourcemap: true,
        },
        plugins: [del({ targets: ['dist'] }), ts()],
    },
];

export default config;
