import path from 'node:path'
import fs from 'node:fs'
import { beforeEach, expect, test } from 'vitest'
import { build } from 'vite'
import mjml from '../src'

const output = path.resolve(__dirname, 'output')
const fixtures = path.resolve(__dirname, 'fixtures')

beforeEach(() => fs.rmSync(output, { recursive: true, force: true }))

test('it compiles', async() => {
	expect(fs.existsSync(output)).toBe(false)

	await build({
		root: fixtures,
		logLevel: 'silent',
		plugins: [
			mjml({
				log: false,
				extension: '.html',
				input: path.resolve(fixtures, 'valid'),
				output,
			}),
		],
	})

	expect(fs.existsSync(path.resolve(output, 'mail', 'mail.html'))).toBe(true)
})

test('it can exclude directories', async() => {
	expect(fs.existsSync(output)).toBe(false)

	await build({
		root: fixtures,
		// logLevel: 'silent',
		plugins: [
			mjml({
				log: false,
				extension: '.html',
				input: path.resolve(fixtures, 'has-excludes'),
				output,
				exclude: [path.resolve(fixtures, 'has-excludes', 'partials')],
			}),
		],
	})
	expect(fs.existsSync(path.resolve(output, 'mail', 'mail.html'))).toBe(true)
	expect(!fs.existsSync(path.resolve(output, 'partials', '_foo.html'))).toBe(true)
})

test('it runs preprocess before compiling', async() => {
	expect(fs.existsSync(output)).toBe(false)

	const seen: string[] = []

	await build({
		root: fixtures,
		logLevel: 'silent',
		plugins: [
			mjml({
				log: false,
				extension: '.html',
				input: path.resolve(fixtures, 'valid'),
				output,
				preprocess: (content, filePath) => {
					seen.push(filePath)
					return content.replace('Hello World', 'Goodbye World')
				},
			}),
		],
	})

	const compiled = fs.readFileSync(path.resolve(output, 'mail', 'mail.html'), 'utf-8')

	// The rewritten token reached the MJML compiler...
	expect(compiled).toContain('Goodbye World')
	// ...and the original token is gone.
	expect(compiled).not.toContain('Hello World')
	// The file path was passed as the second argument.
	expect(seen).toContain(path.resolve(fixtures, 'valid', 'mail', 'mail.mjml').replace(/\\/g, '/'))
})

test('it compiles unchanged when preprocess is omitted', async() => {
	expect(fs.existsSync(output)).toBe(false)

	await build({
		root: fixtures,
		logLevel: 'silent',
		plugins: [
			mjml({
				log: false,
				extension: '.html',
				input: path.resolve(fixtures, 'valid'),
				output,
			}),
		],
	})

	const compiled = fs.readFileSync(path.resolve(output, 'mail', 'mail.html'), 'utf-8')

	expect(compiled).toContain('Hello World')
	expect(compiled).not.toContain('Goodbye World')
})

test('it throws on compilation errors', async() => {
	expect(fs.existsSync(output)).toBe(false)

	await expect(async() => await build({
		root: fixtures,
		logLevel: 'silent',
		plugins: [
			mjml({
				log: false,
				extension: '.html',
				input: path.resolve(fixtures, 'invalid'),
				output,
			}),
		],
	})).rejects.toThrow('Malformed MJML. Check that your structure is correct and enclosed in <mjml> tags.')

	expect(fs.existsSync(output)).toBe(false)
})
