// 等待頁面完全載入後再執行
window.addEventListener('load', () => {
    // 初始化核心功能
    window.LuopanCore.initDebugMode();
    const debug = window.LuopanCore.debug;
    
    debug("Google Map 羵盤插件啟動中...");
    
    // 控制羅盤顯示/隱藏的變數
    let isVisible = false; // 預設隱藏
    
    // 建立主要 UI 元件
    const container = window.LuopanUIComponents.createMainContainer(isVisible);
    const overlay = window.LuopanUIComponents.createOverlay();
    const blackLineContainer = window.LuopanUIComponents.createBlackCrossContainer();
    const blueLineContainer = window.LuopanUIComponents.createBlueCrossContainer();
    const linesContainer = window.LuopanUIComponents.createLinesContainer();
    
    // 初始化位置與尺寸
    window.LuopanPositionManager.initPosition(container);
    
    // 組合所有元件
    container.appendChild(overlay);
    container.appendChild(blackLineContainer);
    container.appendChild(blueLineContainer);
    container.appendChild(linesContainer);
    document.body.appendChild(container);
    
    // 建立事件處理器實例
    const eventHandler = new window.LuopanEventHandler(
        container,
        overlay,
        blackLineContainer,
        blueLineContainer
    );
    
    // 處理擴充功能訊息
    setupMessageHandler(eventHandler, container, debug);
    
    // 通知 background.js 擴充功能已就緒
    chrome.runtime.sendMessage({ action: 'extensionReady' });
});

// 處理訊息的函式
function setupMessageHandler(eventHandler, container, debug) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        debug('收到訊息:', request);
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
                    const rect = container.getBoundingClientRect();
                    window.LuopanPositionManager.handleZoom(container, request.scale);
                    sendResponse({ success: true });
                    break;
            }
        } catch (error) {
            console.error('執行操作失敗:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    });
}
