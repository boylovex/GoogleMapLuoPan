// 初始化核心功能的除錯模式
window.LuopanCore.initDebugMode();

// 等待頁面完全載入後再執行
window.addEventListener('load', () => {
    window.LuopanCore.debug("Google Map 羅盤插件啟動中...");

    // 控制羅盤顯示/隱藏的變數
    let isVisible = false; // 預設隱藏
    
    // 建立主容器
    const container = window.LuopanUIComponents.createMainContainer(isVisible);
    
    // 設定初始尺寸和位置
    const initialWidth = 200;
    const initialHeight = 200;
    window.LuopanUIComponents.setComponentSize(container, initialWidth, initialHeight);
    
    // 計算畫面中間位置
    function updatePosition() {
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        
        const centerX = Math.max(0, (viewportWidth - initialWidth) / 2);
        const centerY = Math.max(0, (viewportHeight - initialHeight) / 2);
        
        window.LuopanUIComponents.setComponentPosition(container, centerX, centerY);
    }
    
    updatePosition();
    window.addEventListener('resize', updatePosition);

    // 建立羅盤圖片
    const overlay = window.LuopanUIComponents.createOverlay();
    
    // 建立各種容器
    const blackLineContainer = window.LuopanUIComponents.createBlackCrossContainer();
    const blueLineContainer = window.LuopanUIComponents.createBlueCrossContainer();
    const linesContainer = window.LuopanUIComponents.createLinesContainer();

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

    // 監視 DOM 變更
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    if (container.style.display === 'block') {
                        container.style.zIndex = '2147483647';
                        chrome.runtime.sendMessage({ 
                            action: 'visibilityChanged', 
                            isVisible: true 
                        });
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    // 設定觀察者
    if (isVisible) {
        setupMutationObserver();
    }

    // 處理來自 popup 的訊息
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        window.LuopanCore.debug('收到訊息:', request);
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

    // 通知擴充功能已就緒
    chrome.runtime.sendMessage({ action: 'extensionReady' });
});
