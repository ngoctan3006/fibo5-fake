let isContentScriptReady = false;

chrome.webNavigation.onHistoryStateUpdated.addListener(({ url }) => {
  if (!isContentScriptReady) return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      action: 'navigate',
      data: url,
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setLocalStorage') {
    chrome.storage.local.set(request.data, () => {
      sendResponse({ message: 'Giá trị đã được lưu vào Local Storage.' });
    });
  } else if (request.action === 'getLocalStorage') {
    chrome.storage.local.get(request.key, (result) => {
      sendResponse({ value: result[request.key] });
    });
  } else if (request.action === 'removeLocalStorage') {
    chrome.storage.local.remove(request.key, () => {
      sendResponse({ message: `Đã xoá thành công key ${request.key}` });
    });
  } else if (request.action === 'contentScriptReady') {
    isContentScriptReady = true;
  }
  return true;
});
