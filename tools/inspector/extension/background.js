chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || typeof tab.id !== 'number') {
    return
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['ect-inspector.js'],
  })
})
