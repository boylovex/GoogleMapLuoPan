chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'extensionReady') {
    // 更新圖示狀態為啟用（高亮）
    chrome.action.enable(sender.tab.id);
  } else if (request.action === 'visibilityChanged') {
    // 根據羅盤的顯示狀態更新圖示
    if (request.isVisible) {
      chrome.action.enable(sender.tab.id);
    } else {
      chrome.action.disable(sender.tab.id);
    }
  }
});