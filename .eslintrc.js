module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	parserOptions: {
		parser: "babel-eslint",
	},
	extends: [
		"@nuxtjs",
		"prettier",
		"prettier/vue",
		"plugin:prettier/recommended",
		"plugin:nuxt/recommended",
	],
	plugins: ["prettier"],
	// add your custom rules here
	rules: {
		"nuxt/no-cjs-in-config": "off",
		"no-console": "off",
		"max-len": ["off", 80, 4],
		"no-prototype-builtins": "off",
		"require-await": "off",
		"one-var": "off",
		"import/order": "off",
		"vue/require-prop-types": "off",
		"vue/component-tags-order": "off",
	},
};
