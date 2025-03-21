// 除錯模式控制
let isDebugMode = false;

// 除錯輔助函式
function debug(...args) {
    if (isDebugMode) {
        console.log('[羅盤除錯]', ...args);
    }
}

// 載入除錯模式設定
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

// 等待頁面完全載入後再執行
window.addEventListener('load', () => {
  debug("Google Map 羵盤插件啟動中...");

  // 控制羅盤顯示/隱藏的變數
  let isVisible = false; // 預設隱藏
  
  // 建立一個容器來同時包含圖片和十字線
  const container = document.createElement('div');
  container.style.position = 'fixed'; // 改為 fixed 定位，相對於視窗
  container.style.display = isVisible ? 'block' : 'none';
  container.style.outline = 'none';
  container.tabIndex = -1; // 使用 -1 允許程式化的焦點，但不進入 Tab 序列
  container.style.userSelect = 'none'; // 防止文字選取
  container.style.webkitUserSelect = 'none';
  
  // 計算瀏覽器視窗的中心點，並設定羅盤初始位置
  const initialWidth = 200; // 羵盤初始寬度
  const initialHeight = 200; // 羵盤初始高度
  
  // 計算畫面中間位置（改為使用 viewport 尺寸）
  function updatePosition() {
    // 使用 clientWidth 和 clientHeight 來獲取可視區域大小
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    
    const centerX = Math.max(0, (viewportWidth - initialWidth) / 2);
    const centerY = Math.max(0, (viewportHeight - initialHeight) / 2);
    
    container.style.top = centerY + 'px';
    container.style.left = centerX + 'px';
  }
  
  // 設定羅盤位於畫面中間
  updatePosition();
  container.style.zIndex = '2147483647';
  container.style.width = initialWidth + 'px';
  container.style.height = initialHeight + 'px';
  container.style.cursor = 'move';
  container.id = 'luopanContainer';

  // 監聽視窗大小變更，重新計算位置
  window.addEventListener('resize', updatePosition);

  // 設置 overlay 圖片
  let overlay = document.createElement('img');
  
  // 從儲存空間載入自訂圖片
  chrome.storage.local.get(['customImageData', 'useDefaultImage'], function(result) {
    if (result.customImageData && !result.useDefaultImage) {
      debug("使用自訂羅盤圖片");
      overlay.src = result.customImageData;
    } else {
      // 使用預設圖片
      const overlayUrl = chrome.runtime.getURL("LuoPan.png");
      debug("使用預設羅盤圖片: " + overlayUrl);
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
  overlay.style.opacity = '0.8'; // 初始透明度
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

  // 將黑色十字線加入容器
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
  
  // 將元素組合在一起
  container.appendChild(overlay);
  container.appendChild(blackLineContainer);  // 加入黑色十字線容器
  blueLineContainer.appendChild(blueHorizontalLine);
  blueLineContainer.appendChild(blueVerticalLine);
  container.appendChild(blueLineContainer); // 添加藍色十字線容器到主容器
  document.body.appendChild(container);
  
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
  container.appendChild(linesContainer);
  
  // 跟踪狀態
  let currentRotation = 0;
  let currentOpacity = 0.8;
  let blueLineRotation = 0;
  
  // 儲存所有線條的陣列
  const lines = [];
  
  // 線條繪製狀態變數
  let isDrawingLine = false;
  let startX = 0;
  let startY = 0;
  let currentLine = null;
  
  // 設定拖曳功能
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let isCtrlPressed = false;
  
  // 監聽 Ctrl 鍵按下 - 使用全域追踪
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Control' && isVisible) {
      isCtrlPressed = true;
      container.style.cursor = 'crosshair';
      debug('Ctrl 鍵已按下，畫線模式已啟用');
    }
    // 按鍵功能處理在另一個專門的處理函式中
  }, true);
  
  window.addEventListener('keyup', function(e) {
    if (e.key === 'Control' && isVisible) {
      isCtrlPressed = false;
      if (!isDragging) {
        container.style.cursor = 'move';
      }
      debug('Ctrl 鍵已釋放，畫線模式已停用');
    }
  }, true);
  
  // 建立事件處理器實例 (使用全域變數)
  const eventHandler = new window.LuopanEventHandler(
    container,
    overlay,
    blackLineContainer,
    blueLineContainer
  );

  // 移除原有的事件處理相關程式碼，改用 eventHandler

  // 修改訊息監聽處理
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
          eventHandler.handleZoom(request.scale, rect);
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
