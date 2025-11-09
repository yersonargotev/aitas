import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true, // Migrated from PPR to Cache Components
	reactCompiler: true,
};

export default nextConfig;