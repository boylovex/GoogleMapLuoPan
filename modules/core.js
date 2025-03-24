// 核心模組處理主要功能和狀態管理
class LuopanCore {
    constructor() {
        this.isDebugMode = false;
        this.isVisible = false;
        this.mutationObserver = null;
        
        // 初始化除錯模式
        this.initDebugMode();
        
        // 綁定方法的 this 上下文
        this.debug = this.debug.bind(this);
        this.handleExtensionMessage = this.handleExtensionMessage.bind(this);
        this.setupMutationObserver = this.setupMutationObserver.bind(this);
    }

    // 除錯輔助函式
    debug(...args) {
        if (this.isDebugMode) {
            console.log('[羅盤除錯]', ...args);
        }
    }

    // 初始化除錯模式
    initDebugMode() {
        chrome.storage.local.get(['debugMode'], (result) => {
            this.isDebugMode = result.debugMode || false;
            this.debug('除錯模式：', this.isDebugMode ? '開啟' : '關閉');
        });

        // 監聽除錯模式變更
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.debugMode) {
                this.isDebugMode = changes.debugMode.newValue;
                this.debug('除錯模式已變更為：', this.isDebugMode ? '開啟' : '關閉');
            }
        });
    }

    // 設定變更監視器
    setupMutationObserver(container) {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        this.mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    if (container.style.display === 'block') {
                        container.style.zIndex = '2147483647';
                        this.notifyVisibilityChange(true);
                    }
                }
            }
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    // 處理擴充功能訊息
    handleExtensionMessage(request, sender, sendResponse, eventHandler) {
        this.debug('收到訊息:', request);
        try {
            switch (request.action) {
                case 'getVisibility':
                    sendResponse({ success: true, isVisible: eventHandler.isVisible });
                    break;
                case 'toggleVisibility':
                    eventHandler.toggleVisibility();
                    sendResponse({ success: true });
                    break;
                case 'rotateLuopan':
                    eventHandler.rotateOverlay(request.degrees);
                    sendResponse({ success: true });
                    break;
                case 'rotateBlueLines':
                    eventHandler.rotateBlueLines(request.degrees);
                    sendResponse({ success: true });
                    break;
                case 'adjustOpacity':
                    eventHandler.adjustOpacity(request.delta);
                    sendResponse({ success: true });
                    break;
                case 'clearAllLines':
                    eventHandler.clearAllLines();
                    sendResponse({ success: true });
                    break;
                case 'zoomLuoPan':
                    window.LuopanPositionManager.handleZoom(eventHandler.container, request.scale);
                    sendResponse({ success: true });
                    break;
                default:
                    sendResponse({ success: false, error: '未知的操作' });
            }
        } catch (error) {
            console.error('執行操作失敗:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }

    // 通知可見性變更
    notifyVisibilityChange(isVisible) {
        this.isVisible = isVisible;
        chrome.runtime.sendMessage({ 
            action: 'visibilityChanged', 
            isVisible: isVisible 
        });
    }

    // 初始化擴充功能
    initialize() {
        this.debug("Google Map 羅盤插件啟動中...");
        chrome.runtime.sendMessage({ action: 'extensionReady' });
    }
}

// 建立並導出單例實例
window.LuopanCore = new LuopanCore();