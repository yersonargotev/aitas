import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		ppr: true,
		reactCompiler: true,
	},
	compiler: {
		removeConsole: {
			exclude: ["error"],
		},
	},
};

export default nextConfig;
