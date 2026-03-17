import { defineConfig } from 'orval';

const orvalOutputPath = "src/orval";
const backendBaseURL = "https://96de-2001-569-7bfc-3a00-6855-cddd-a6f0-777f.ngrok-free.app"

export default defineConfig({
    api: {
        input: {
            target: `${backendBaseURL}/api/v1/openapi.json`,
        },
        output: {
            mode: 'tags-split',
            target: `${orvalOutputPath}/hooks/index.ts`,
            schemas: `${orvalOutputPath}/model`,
            client: 'react-query',
            mock: false,
            baseUrl: {
                getBaseUrlFromSpecification: true,
            },
            prettier: true,
            override: {
                mutator: {
                    path: './src/lib/orval-clients/orval-client-fetch.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});
