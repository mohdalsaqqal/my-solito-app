/* ECT Standalone Inspector
 * Usage:
 * 1) Open page in browser (dev mode preferred)
 * 2) Open DevTools Console
 * 3) Paste this file content and run
 * 4) Toggle "Inspect: ON", then click any element
 */
(function ectInspectorInit() {
  if (window.__ECT_INSPECTOR_ACTIVE__ && typeof window.__ECT_INSPECTOR_TEARDOWN__ === 'function') {
    window.__ECT_INSPECTOR_TEARDOWN__()
  }
  if (window.__ECT_INSPECTOR_ACTIVE__) return
  window.__ECT_INSPECTOR_ACTIVE__ = true

  const MOD_KEY_HINT = 'Alt+X'

  function createSelector(el) {
    if (!el || el.nodeType !== 1) return ''
    if (el.id) return `#${el.id}`

    const parts = []
    let current = el
    let depth = 0
    while (current && current.nodeType === 1 && depth < 6) {
      let part = current.tagName.toLowerCase()
      if (current.classList && current.classList.length > 0) {
        part += '.' + Array.from(current.classList).slice(0, 2).join('.')
      }

      const parent = current.parentElement
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.tagName === current.tagName
        )
        if (siblings.length > 1) {
          const idx = siblings.indexOf(current) + 1
          part += `:nth-of-type(${idx})`
        }
      }
      parts.unshift(part)
      current = parent
      depth += 1
    }
    return parts.join(' > ')
  }

  function findReactFiber(node) {
    let current = node
    let guard = 0
    while (current && guard < 10) {
      const keys = Object.keys(current)
      const fiberKey = keys.find((k) => k.startsWith('__reactFiber$'))
      if (fiberKey) {
        return current[fiberKey]
      }
      current = current.parentElement
      guard += 1
    }
    return null
  }

  function getComponentChain(fiber) {
    if (!fiber) return []
    const names = []
    let cur = fiber
    let guard = 0
    while (cur && guard < 25) {
      const t = cur.type || cur.elementType
      const name =
        (typeof t === 'function' && (t.displayName || t.name)) ||
        (typeof t === 'string' ? t : null)
      if (name) names.push(name)
      cur = cur.return
      guard += 1
    }
    return names
  }

  function findDebugSource(fiber) {
    let cur = fiber
    let guard = 0
    while (cur && guard < 25) {
      if (cur._debugSource && cur._debugSource.fileName) return cur._debugSource
      cur = cur.return
      guard += 1
    }
    return null
  }

  function compactText(el) {
    if (!el) return ''
    return (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120)
  }

  function escapeHtml(input) {
    if (input == null) return ''
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function getElementTarget(rawTarget) {
    if (!(rawTarget instanceof HTMLElement)) return null
    if (panel.contains(rawTarget)) return null
    if (highlightBox.contains(rawTarget)) return null
    return rawTarget
  }

  function getRectSnapshot(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null
    const rect = el.getBoundingClientRect()
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    }
  }

  const panel = document.createElement('div')
  panel.id = 'ect-inspector-panel'
  panel.style.cssText = [
    'position:fixed',
    'bottom:12px',
    'right:12px',
    'z-index:2147483647',
    'width:min(96vw,580px)',
    'background:rgba(255,255,255,0.96)',
    'backdrop-filter:blur(4px)',
    'border:1px solid #dbe0e8',
    'box-shadow:0 8px 24px rgba(15,23,42,0.12)',
    'padding:10px',
    'font:12px/1.4 Inter,system-ui,sans-serif',
    'color:#334155',
  ].join(';')

  panel.innerHTML =
    '<div id="ect-inspector-drag-handle" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;cursor:move;user-select:none;">' +
    '<strong style="font-size:12px;color:#0f172a;">ECT Inspector</strong>' +
    '<button id="ect-inspector-close" style="border:1px solid #cbd5e1;background:#fff;padding:4px 8px;cursor:pointer;">Close</button>' +
    '</div>' +
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">' +
    '<button id="ect-inspector-toggle" style="border:1px solid #cbd5e1;background:#fff;padding:4px 8px;cursor:pointer;">Inspect: ON</button>' +
    `<span style="color:#64748b;">Shortcut: ${MOD_KEY_HINT}</span>` +
    '</div>' +
    '<div id="ect-inspector-body" style="display:grid;gap:4px;">Inspect mode is ON. Hover + click any element.</div>' +
    '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">' +
    '<button id="ect-copy-selector" style="border:1px solid #cbd5e1;background:#fff;padding:4px 8px;cursor:pointer;">Copy Selector</button>' +
    '<button id="ect-copy-source" style="border:1px solid #cbd5e1;background:#fff;padding:4px 8px;cursor:pointer;">Copy Source</button>' +
    '<button id="ect-copy-json" style="border:1px solid #cbd5e1;background:#fff;padding:4px 8px;cursor:pointer;">Copy JSON</button>' +
    '<button id="ect-copy-ask" style="border:1px solid #cbd5e1;background:#fff;padding:4px 8px;cursor:pointer;">Ask Codex</button>' +
    '</div>'

  document.body.appendChild(panel)

  const highlightBox = document.createElement('div')
  highlightBox.id = 'ect-inspector-highlight'
  highlightBox.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:2147483646',
    'border:2px solid rgba(221,33,39,0.95)',
    'background:rgba(221,33,39,0.08)',
    'border-radius:4px',
    'display:none',
  ].join(';')
  document.body.appendChild(highlightBox)

  const body = panel.querySelector('#ect-inspector-body')
  const dragHandle = panel.querySelector('#ect-inspector-drag-handle')
  const closeBtn = panel.querySelector('#ect-inspector-close')
  const toggleBtn = panel.querySelector('#ect-inspector-toggle')
  const copySelectorBtn = panel.querySelector('#ect-copy-selector')
  const copySourceBtn = panel.querySelector('#ect-copy-source')
  const copyJsonBtn = panel.querySelector('#ect-copy-json')
  const copyAskBtn = panel.querySelector('#ect-copy-ask')

  let lastPayload = null
  let inspectMode = true
  let dragging = false
  let dragOffsetX = 0
  let dragOffsetY = 0

  function render(payload) {
    if (!payload) return
    body.innerHTML =
      `<div><b>tag</b>: ${escapeHtml(payload.tag)}</div>` +
      `<div><b>selector</b>: ${escapeHtml(payload.selector)}</div>` +
      `<div><b>text</b>: ${escapeHtml(payload.text || '(none)')}</div>` +
      `<div><b>name</b>: ${escapeHtml(payload.name || '(none)')}</div>` +
      `<div><b>class</b>: ${escapeHtml(payload.className || '(none)')}</div>` +
      `<div><b>mapped</b>: ${escapeHtml(payload.nodeMarker || '(unmapped)')}</div>` +
      `<div><b>reactComponent</b>: ${escapeHtml(payload.reactComponent || '(unknown)')}</div>` +
      `<div><b>reactSource</b>: ${escapeHtml(payload.reactSource || '(unknown)')}</div>` +
      `<div><b>url</b>: ${escapeHtml(payload.url)}</div>`
  }

  function setInspectMode(next) {
    inspectMode = !!next
    if (!toggleBtn) return
    toggleBtn.textContent = inspectMode ? 'Inspect: ON' : 'Inspect: OFF'
    toggleBtn.style.background = inspectMode ? '#fee2e2' : '#fff'
    if (!inspectMode) {
      highlightBox.style.display = 'none'
    }
  }

  function copyText(v) {
    if (!v) return
    navigator.clipboard.writeText(v).catch(() => {})
  }

  function teardown() {
    window.removeEventListener('mousemove', onDragMove, true)
    window.removeEventListener('mouseup', onDragEnd, true)
    window.removeEventListener('mousemove', onMouseMove, true)
    window.removeEventListener('click', onClick, true)
    window.removeEventListener('keydown', onKeyDown, true)
    highlightBox.remove()
    panel.remove()
    delete window.__ECT_INSPECTOR_ACTIVE__
    delete window.__ECT_INSPECTOR_TEARDOWN__
  }

  window.__ECT_INSPECTOR_TEARDOWN__ = teardown

  function onDragStart(event) {
    if (!(event.target instanceof HTMLElement)) return
    if (event.target.closest('button')) return
    dragging = true
    const rect = panel.getBoundingClientRect()
    dragOffsetX = event.clientX - rect.left
    dragOffsetY = event.clientY - rect.top
    panel.style.left = `${rect.left}px`
    panel.style.top = `${rect.top}px`
    panel.style.right = 'auto'
    panel.style.bottom = 'auto'
    event.preventDefault()
  }

  function onDragMove(event) {
    if (!dragging) return
    panel.style.left = `${Math.max(0, event.clientX - dragOffsetX)}px`
    panel.style.top = `${Math.max(0, event.clientY - dragOffsetY)}px`
  }

  function onDragEnd() {
    dragging = false
  }

  dragHandle.addEventListener('mousedown', onDragStart)
  window.addEventListener('mousemove', onDragMove, true)
  window.addEventListener('mouseup', onDragEnd, true)

  closeBtn.addEventListener('click', () => {
    teardown()
  })

  toggleBtn.addEventListener('click', () => {
    setInspectMode(!inspectMode)
  })

  copySelectorBtn.addEventListener('click', () => {
    copyText(lastPayload && lastPayload.selector)
  })

  copySourceBtn.addEventListener('click', () => {
    copyText(lastPayload && (lastPayload.nodeMarker || lastPayload.reactSource || ''))
  })

  copyJsonBtn.addEventListener('click', () => {
    copyText(lastPayload ? `[ECT_INSPECT] ${JSON.stringify(lastPayload)}` : '')
  })

  copyAskBtn.addEventListener('click', () => {
    if (!lastPayload) return
    const prompt =
      'Please update this selected element based on my request.\n\n' +
      '[ECT_INSPECT] ' + JSON.stringify(lastPayload) + '\n\n' +
      'Requested change:\n' +
      '- '
    copyText(prompt)
  })

  function updateHighlight(target) {
    const rect = getRectSnapshot(target)
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      highlightBox.style.display = 'none'
      return
    }
    highlightBox.style.display = 'block'
    highlightBox.style.left = `${rect.x}px`
    highlightBox.style.top = `${rect.y}px`
    highlightBox.style.width = `${rect.width}px`
    highlightBox.style.height = `${rect.height}px`
  }

  function collectPayload(target) {
    const markerNode = target.closest('[data-ect-node]')
    const nodeMarker = markerNode ? markerNode.getAttribute('data-ect-node') : null

    const fiber = findReactFiber(target)
    const chain = getComponentChain(fiber)
    const debugSource = findDebugSource(fiber)

    return {
      tag: target.tagName.toLowerCase(),
      selector: createSelector(target),
      text: compactText(target),
      name:
        target.getAttribute('aria-label') ||
        target.getAttribute('name') ||
        target.getAttribute('data-testid') ||
        '',
      className:
        typeof target.className === 'string'
          ? target.className.trim().replace(/\s+/g, ' ').slice(0, 180)
          : '',
      nodeMarker,
      reactComponent: chain.find((n) => n && n[0] === n[0].toUpperCase()) || chain[0] || '',
      reactSource: debugSource
        ? `${debugSource.fileName}:${debugSource.lineNumber || 1}`
        : '',
      componentChain: chain,
      rect: getRectSnapshot(target),
      url: location.href,
      ts: new Date().toISOString(),
    }
  }

  function onMouseMove(event) {
    if (!inspectMode) return
    const target = getElementTarget(event.target)
    if (!target) {
      highlightBox.style.display = 'none'
      return
    }
    updateHighlight(target)
  }

  function onClick(event) {
    const allowLegacyAltSelect = event.altKey
    if (!inspectMode && !allowLegacyAltSelect) return
    const target = getElementTarget(event.target)
    if (!target) return

    event.preventDefault()
    event.stopPropagation()
    const payload = collectPayload(target)

    lastPayload = payload
    render(payload)
    console.log('[ECT_INSPECT]', payload)
    copyText(`[ECT_INSPECT] ${JSON.stringify(payload)}`)
  }

  function onKeyDown(event) {
    if (event.altKey && (event.key === 'x' || event.key === 'X')) {
      event.preventDefault()
      setInspectMode(!inspectMode)
    }
  }

  window.addEventListener('mousemove', onMouseMove, true)
  window.addEventListener('click', onClick, true)
  window.addEventListener('keydown', onKeyDown, true)
  setInspectMode(true)
})()
