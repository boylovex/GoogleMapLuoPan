// 核心模組處理除錯功能和基本設定

// 除錯模式控制
let isDebugMode = false;

// 除錯輔助函式
function debug(...args) {
    if (isDebugMode) {
        console.log('[羅盤除錯]', ...args);
    }
}

// 初始化除錯模式
function initDebugMode() {
    chrome.storage.local.get(['debugMode'], function(result) {
        isDebugMode = result.debugMode || false;
        debug('除錯模式：', isDebugMode ? '開啟' : '關閉');
    });

    // 監聽除錯模式變更
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'local' && changes.debugMode) {
            isDebugMode = changes.debugMode.newValue;
            debug('除錯模式已變更為：', isDebugMode ? '開啟' : '關閉');
        }
    });
}

// 對外公開函式
window.LuopanCore = {
    debug,
    initDebugMode
};