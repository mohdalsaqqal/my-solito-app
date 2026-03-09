/* ECT Inspector Loader
 * Console usage:
 *   (async () => { await import('/dev/ect-inspector-loader.js') })()
 */
(function loadEctInspector() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  if (window.__ECT_INSPECTOR_ACTIVE__ && typeof window.__ECT_INSPECTOR_TEARDOWN__ === 'function') {
    window.__ECT_INSPECTOR_TEARDOWN__()
    return
  }

  var script = document.createElement('script')
  script.src = '/dev/ect-inspector.js?t=' + Date.now()
  script.async = true
  document.head.appendChild(script)
})()
