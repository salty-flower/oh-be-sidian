import type Readability_ from '@mozilla/readability'
import { isNil } from 'lodash-es'
import type TurndownService from 'turndown'
import { getSelectionHtml } from './utils'

Promise.all([
	// @ts-ignore
	import('https://esm.sh/turndown') as Promise<{
		default: TurndownService
	}>,
	// @ts-ignore
	import('https://esm.sh/@mozilla/readability') as Promise<
		typeof Readability_
	>
])
	.then(async ([{ default: Turndown }, { Readability }]) => {
		const options = {
			vault: '',
			folder: '',
			tags: 'clippings'
		}
		const vault_name = isNil(options.vault)
			? ''
			: `&vault=${encodeURIComponent(`${options.vault}`)}`

		const selection = getSelectionHtml()

		const {
			title,
			byline: author,
			content
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
		} = new Readability(document.cloneNode(true) as Document).parse()!

		// I'm a Windows user xD
		const file_name = title.replace(':', '').replace(/[/\\?%*|'<>]/g, '-')
		const content_to_convert =
			selection === undefined || selection === '' ? content : selection

		const converted_content = (
			Turndown as unknown as (
				options: TurndownService.Options
			) => TurndownService
		)({
			headingStyle: 'atx',
			hr: '---',
			bulletListMarker: '-',
			codeBlockStyle: 'fenced',
			emDelimiter: '*'
		}).turndown(content_to_convert)

		const file_content = (function compose_file_content() {
			const tag_line = `---\ntags: ${[
				options.tags,
				prompt('Any additional tags (separate by comma)?')
			]
				.filter(s => !isNil(s) && s !== '')
				.join(', ')}\n---\n`
			const clipped_time_line = `| Time  | ${new Date().toLocaleString(
				'zh-cn'
			)} |`
			const alignment_line = '|:---------- |:--- |'
			const source_line = `| Source | ${document.URL} |`
			const author_line = isNil(author) ? '' : `| Author  | ${author} |`

			const headers = [
				tag_line,
				clipped_time_line,
				alignment_line,
				source_line,
				author_line
			]
			return `${headers.join('\n')}\n\n${converted_content}`
		})()

		const finalObsidianUrl =
			`obsidian://new?file=${encodeURIComponent(
				options.folder + file_name
			)}&content=${encodeURIComponent(file_content)}${vault_name}`

		document.location.href = finalObsidianUrl
		console.log(finalObsidianUrl)
	})
	.finally(async () =>
		fetch(`https://archive.ph/submit/?url=${document.URL}`, {
			mode: 'no-cors'
		})
	)
