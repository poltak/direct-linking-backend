import scrollToElement from 'scroll-to-element'
import { modifyState, getState } from '../state'
import { delayed, copyToClipboard } from '../utils'
import { selectionToDescriptor } from '../utils/annotations'
import { requestCreateLinkToClipboard, resetLinkState } from './actions'

export function setupSelectionHandler() {
    document.querySelector('.area.middle').addEventListener('mouseup', event => {
        if (!getState('tooltip.active')) {
            updateTooltipPosition({pointerX: event.pageX, pointerY: event.pageY})
            activateToolTipIfNeeded()
        }
    })

    const $tooltipContainer = document.querySelector('.tooltip-container')
    $tooltipContainer.addEventListener('click', event => {
        const directClick = event.target === $tooltipContainer
        if (directClick) {
            modifyState('tooltip.active', false)
            resetLinkState()
        }
    })
}

export function setupCreationLink() {
    document.querySelector('.create-link-button').addEventListener('mousedown', async (event) => {
        const anchor = await extractAnchor()
        requestCreateLinkToClipboard({anchor: anchor})
    })
}

export function setupCopyLink() {
    document.querySelector('.tooltip .url').addEventListener('click', event => {
        event.preventDefault()
        copyToClipboard(getState('link.url'))
        modifyState('link.progress', 'copied')
    })
}

function updateTooltipPosition({pointerX, pointerY}) {
    modifyState('tooltip.position', {x: pointerX, y: pointerY})
}

export const activateToolTipIfNeeded = delayed(function () {
    const selection = document.getSelection()
    const userSelectedText = !!selection && !selection.isCollapsed
    if (userSelectedText) {
        modifyState('tooltip.active', true)
    }
}, 300)

async function extractAnchor() {
    const selection = document.getSelection()
    const descriptor = await selectionToDescriptor({selection})

    return {
        quote: selection.toString(),
        descriptor
    }
}

export function scrollToHighlight() {
    const $highlight = document.querySelector('.highlight')
    if ($highlight) {
        setTimeout(() => {
            scrollToElement($highlight)
        }, 300)
    } else {
        console.error('Oops, no highlight found to scroll to')
    }
}
