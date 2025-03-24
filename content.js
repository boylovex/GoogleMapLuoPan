// 初始化核心功能的除錯模式
window.LuopanCore.initDebugMode();

// 等待頁面完全載入後再執行
window.addEventListener('load', () => {
    // 初始化核心功能
    window.LuopanCore.initialize();
    
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

    // 建立角度顯示器
    const angleDisplay = window.LuopanUIComponents.createAngleDisplay();
    container.appendChild(angleDisplay);

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

    // 設定 DOM 變更監視器
    if (isVisible) {
        window.LuopanCore.setupMutationObserver(container);
    }

    // 監聽擴充功能訊息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        return window.LuopanCore.handleExtensionMessage(request, sender, sendResponse, eventHandler);
    });
});
