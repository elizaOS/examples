import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3345,
		proxy: {
			"/api": {
				target: "http://localhost:3344",
				changeOrigin: true,
			},
			"/socket.io": {
				target: "http://localhost:3344",
				ws: true,
			},
		},
	},
});
