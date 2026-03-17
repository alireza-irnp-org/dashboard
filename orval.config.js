import { defineConfig } from 'orval';

export default defineConfig({
    api: {
        output: {
            mode: 'tags-split',
            target: 'src/orval-api/index.ts',
            schemas: 'src/orval-api/model',
            client: 'react-query',
            mock: false,
            baseUrl: {
                getBaseUrlFromSpecification: true,
            },
            prettier: true,
            override: {
                mutator: {
                    path: './src/lib/orval-client-fetch.ts',
                    name: 'customInstance',
                },
            },
        },
        input: {
            // target: `${process.env.NEXT_PUBLIC_APP_URL}/api/openapi.json`,
            target: `https://96de-2001-569-7bfc-3a00-6855-cddd-a6f0-777f.ngrok-free.app/api/openapi.json`,
        },
    },
});
