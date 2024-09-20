import { CoverageReporter } from "vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
	cacheDir: "./.cache/.vitest",
	test: {
		coverage: {
			enabled: true,
			include: [
				"app/**/*.ts",
				"app/**/*.tsx",
				"components/**/*.ts",
				"components/**/*.tsx",
				"hooks/**/*.ts",
				"hooks/**/*.tsx",
				"utils/**/*.ts",
				"utils/**/*.tsx",
			],
			reportsDirectory: "./reports/coverage/unit",
		},
		environment: "jsdom",
	},
});
