import { isNil } from 'lodash-es'

export function getSelectionHtml() {
	const sele = window.getSelection()
	const container = document.createElement('div')

	for (const e of [...Array(sele?.rangeCount ?? 0).keys()]
		.map(i => sele?.getRangeAt(i).cloneContents())
		.filter(s => !isNil(s)) as DocumentFragment[]) {
		container.appendChild(e)
	}

	return container.innerHTML
}
