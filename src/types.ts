import { MJMLParsingOptions } from 'mjml-core'
import { Logger } from 'vite'

export interface Options {
	input: string
	views: string
	output: string
	extension: string
	exclude: string | string[]
	watch: boolean
	log: boolean
	mjml?: MJMLParsingOptions
	/**
	 * Transforms the raw file contents before they are passed to the MJML compiler.
	 *
	 * @param content The raw contents read from the `.mjml` file.
	 * @param filePath The path of the file being compiled.
	 * @returns The source to compile with MJML.
	 */
	preprocess?: (content: string, filePath: string) => string
}

export interface CompileOptions extends Options {
	logger: Logger
	building: boolean
}
