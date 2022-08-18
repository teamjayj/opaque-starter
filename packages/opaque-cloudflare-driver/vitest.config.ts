import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: ['./test/vitest.setup-file.ts'],
        coverage: {
            reporter: ['text', 'html'],
            exclude: ['node_modules', './test/vitest.setup-file.ts'],
        },
        deps: {
            inline: true,
        },
    },
});
