import { defineEslintConfig } from '@innocenzi/eslint-config'

export default defineEslintConfig(
	{},
	{
		ignores: [
			'**/node_modules',
			'**/dist',
			'**/public',
			'**/vendor',
		],
	},
)
