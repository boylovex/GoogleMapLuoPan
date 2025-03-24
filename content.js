// 初始化核心功能的除錯模式
window.LuopanCore.initDebugMode();

// 等待頁面完全載入後再執行
window.addEventListener('load', () => {
    window.LuopanCore.debug("Google Map 羵盤插件啟動中...");

    // 控制羅盤顯示/隱藏的變數
    let isVisible = false; // 預設隱藏
    
    // 建立一個容器來同時包含圖片和十字線
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.display = isVisible ? 'block' : 'none';
    container.style.outline = 'none';
    container.tabIndex = -1;
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';
    
    // 計算瀏覽器視窗的中心點，並設定羅盤初始位置
    const initialWidth = 200;
    const initialHeight = 200;
    
    // 計算畫面中間位置（改為使用 viewport 尺寸）
    function updatePosition() {
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        
        const centerX = Math.max(0, (viewportWidth - initialWidth) / 2);
        const centerY = Math.max(0, (viewportHeight - initialHeight) / 2);
        
        container.style.top = centerY + 'px';
        container.style.left = centerX + 'px';
    }
    
    updatePosition();
    container.style.zIndex = '2147483647';
    container.style.width = initialWidth + 'px';
    container.style.height = initialHeight + 'px';
    container.style.cursor = 'move';
    container.id = 'luopanContainer';

    window.addEventListener('resize', updatePosition);

    // 設置 overlay 圖片
    let overlay = document.createElement('img');
    
    // 從儲存空間載入自訂圖片
    chrome.storage.local.get(['customImageData', 'useDefaultImage'], function(result) {
        if (result.customImageData && !result.useDefaultImage) {
            window.LuopanCore.debug("使用自訂羅盤圖片");
            overlay.src = result.customImageData;
        } else {
            const overlayUrl = chrome.runtime.getURL("LuoPan.png");
            window.LuopanCore.debug("使用預設羅盤圖片: " + overlayUrl);
            overlay.src = overlayUrl;
        }
        
        overlay.onerror = function() {
            console.error("圖片載入失敗，使用預設圖片");
            overlay.src = chrome.runtime.getURL("LuoPan.png");
        };
    });
    
    overlay.style.position = 'absolute';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.opacity = '0.8';
    overlay.id = 'luopanOverlay';

    // 建立黑色十字線容器
    const blackLineContainer = document.createElement('div');
    blackLineContainer.id = 'blackCrossContainer';
    blackLineContainer.style.position = 'absolute';
    blackLineContainer.style.width = '100%';
    blackLineContainer.style.height = '100%';
    blackLineContainer.style.top = '0';
    blackLineContainer.style.left = '0';
    blackLineContainer.style.pointerEvents = 'none';
    blackLineContainer.style.zIndex = '2147483646';

    // 建立水平線（黑色）
    const horizontalLine = document.createElement('div');
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.width = '100%';
    horizontalLine.style.height = '2px';
    horizontalLine.style.backgroundColor = 'black';
    horizontalLine.style.top = '50%';
    horizontalLine.style.left = '0';
    horizontalLine.style.transform = 'translateY(-50%)';
    horizontalLine.style.pointerEvents = 'none';
    
    // 建立垂直線（黑色）
    const verticalLine = document.createElement('div');
    verticalLine.style.position = 'absolute';
    verticalLine.style.width = '2px';
    verticalLine.style.height = '100%';
    verticalLine.style.backgroundColor = 'black';
    verticalLine.style.top = '0';
    verticalLine.style.left = '50%';
    verticalLine.style.transform = 'translateX(-50%)';
    verticalLine.style.pointerEvents = 'none';

    blackLineContainer.appendChild(horizontalLine);
    blackLineContainer.appendChild(verticalLine);

    // 建立藍色十字線容器
    const blueLineContainer = document.createElement('div');
    blueLineContainer.id = 'blueCrossContainer';
    blueLineContainer.style.position = 'absolute';
    blueLineContainer.style.width = '100%';
    blueLineContainer.style.height = '100%';
    blueLineContainer.style.top = '0';
    blueLineContainer.style.left = '0';
    blueLineContainer.style.pointerEvents = 'none';
    blueLineContainer.style.zIndex = '2147483645';
    
    // 建立水平藍線
    const blueHorizontalLine = document.createElement('div');
    blueHorizontalLine.style.position = 'absolute';
    blueHorizontalLine.style.width = '100%';
    blueHorizontalLine.style.height = '2px';
    blueHorizontalLine.style.backgroundColor = 'blue';
    blueHorizontalLine.style.top = '50%';
    blueHorizontalLine.style.left = '0';
    blueHorizontalLine.style.transform = 'translateY(-50%)';
    blueHorizontalLine.style.pointerEvents = 'none';
    blueHorizontalLine.style.opacity = '1';
    
    // 建立垂直藍線
    const blueVerticalLine = document.createElement('div');
    blueVerticalLine.style.position = 'absolute';
    blueVerticalLine.style.width = '2px';
    blueVerticalLine.style.height = '100%';
    blueVerticalLine.style.backgroundColor = 'blue';
    blueVerticalLine.style.top = '0';
    blueVerticalLine.style.left = '50%';
    blueVerticalLine.style.transform = 'translateX(-50%)';
    blueVerticalLine.style.pointerEvents = 'none';
    blueVerticalLine.style.opacity = '1';

    blueLineContainer.appendChild(blueHorizontalLine);
    blueLineContainer.appendChild(blueVerticalLine);
    
    // 建立線條容器
    const linesContainer = document.createElement('div');
    linesContainer.id = 'luopanLinesContainer';
    linesContainer.style.position = 'absolute';
    linesContainer.style.top = '0';
    linesContainer.style.left = '0';
    linesContainer.style.width = '100%';
    linesContainer.style.height = '100%';
    linesContainer.style.pointerEvents = 'none';
    linesContainer.style.zIndex = '2147483644';

    // 將元素組合在一起
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

    // 建立 MutationObserver 來監視 DOM 變更
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

    // 在初始化時設定觀察者
    if (isVisible) {
        setupMutationObserver();
    }

    // 修改監聽來自 popup 的訊息處理機制
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

    // 通知 background.js 擴充功能已就緒
    chrome.runtime.sendMessage({ action: 'extensionReady' });
});
