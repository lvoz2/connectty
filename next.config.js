//import webpack from "webpack/webpack-lib.js";
import pkg from "webpack-subresource-integrity";
const { SubresourceIntegrityPlugin } = pkg;

export default {
	poweredByHeader: false,
	webpack: (config, {buildId, dev, isServer, defaultLoaders, nextRuntime, webpack}) => {
		//config.externalsPresets = {node: true};
		//config.resolve.fallback = {"crypto": import.meta.resolve("crypto-browserify"), "node:crypto": import.meta.resolve("crypto-browserify")};
		//config.plugins.push(new webpack.NormalModuleReplacementPlugin(/crypto/, "crypto-browserify"));
		config.plugins.push(new SubresourceIntegrityPlugin())
		return config
	},
};
