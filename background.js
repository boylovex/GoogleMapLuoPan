// 負責管理擴充功能的背景程式
class BackgroundController {
    constructor() {
        this.initialize();
    }

    // 初始化背景程式
    initialize() {
        this.setupMessageListeners();
    }

    // 設定訊息監聽器
    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
        });
    }

    // 處理訊息
    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'extensionReady':
                this.handleExtensionReady(sender.tab.id);
                break;
            case 'visibilityChanged':
                this.handleVisibilityChanged(sender.tab.id, request.isVisible);
                break;
        }
    }

    // 處理擴充功能就緒
    handleExtensionReady(tabId) {
        chrome.action.enable(tabId);
    }

    // 處理羅盤顯示狀態變更
    handleVisibilityChanged(tabId, isVisible) {
        if (isVisible) {
            chrome.action.enable(tabId);
        } else {
            chrome.action.disable(tabId);
        }
    }
}

// 建立並啟動背景控制器
new BackgroundController();