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
  debug("Google Map 羅盤插件啟動中...");

  // 控制羅盤顯示/隱藏的變數
  let isVisible = false; // 預設隱藏
  
  // 建立一個容器來同時包含圖片和十字線
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.display = isVisible ? 'block' : 'none';
  
  // 計算瀏覽器視窗的中心點，並設定羅盤初始位置
  const initialWidth = 200; // 羵盤初始寬度
  const initialHeight = 200; // 羵盤初始高度
  
  // 計算畫面中間位置
  const centerX = Math.max(0, (window.innerWidth - initialWidth) / 2);
  const centerY = Math.max(0, (window.innerHeight - initialHeight) / 2);
  
  // 設定羅盤位於畫面中間
  container.style.top = centerY + 'px';
  container.style.left = centerX + 'px';
  container.style.zIndex = '9999';
  container.style.width = initialWidth + 'px';
  container.style.height = initialHeight + 'px';
  container.style.cursor = 'move';
  container.id = 'luopanContainer';
  
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
  
  // 建立水平線（黑色）
  const horizontalLine = document.createElement('div');
  horizontalLine.style.position = 'absolute';
  horizontalLine.style.width = '100%';
  horizontalLine.style.height = '2px';
  horizontalLine.style.backgroundColor = 'black';
  horizontalLine.style.top = '50%';
  horizontalLine.style.left = '0';
  horizontalLine.style.transform = 'translateY(-50%)';
  horizontalLine.style.zIndex = '10000';
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
  verticalLine.style.zIndex = '10000';
  verticalLine.style.pointerEvents = 'none';

  // 建立藍色十字線容器
  const blueLineContainer = document.createElement('div');
  blueLineContainer.id = 'blueCrossContainer';
  blueLineContainer.style.position = 'absolute';
  blueLineContainer.style.width = '100%';
  blueLineContainer.style.height = '100%';
  blueLineContainer.style.top = '0';
  blueLineContainer.style.left = '0';
  blueLineContainer.style.pointerEvents = 'none';
  blueLineContainer.style.zIndex = '10002';
  
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
  
  // 將元素組合在一起
  container.appendChild(overlay);
  container.appendChild(horizontalLine);
  container.appendChild(verticalLine);
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
  linesContainer.style.zIndex = '10001';
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
  
  // 應用羅盤旋轉
  function applyRotation() {
    overlay.style.transform = `rotate(${currentRotation}deg)`;
    debug(`羅盤旋轉至: ${currentRotation} 度`);
  }
  
  // 旋轉羅盤
  function rotateOverlay(degrees) {
    currentRotation = (currentRotation + degrees) % 360;
    if (currentRotation < 0) currentRotation += 360;
    applyRotation();
    debug(`旋轉羅盤，當前角度: ${currentRotation}`);
  }
  
  // 應用藍色十字線的旋轉
  function applyBlueLineRotation() {
    blueLineContainer.style.transform = `rotate(${blueLineRotation}deg)`;
    debug(`藍色十字線旋轉至: ${blueLineRotation} 度`);
  }
  
  // 旋轉藍色十字線
  function rotateBlueLines(degrees) {
    blueLineRotation = (blueLineRotation + degrees) % 360;
    if (blueLineRotation < 0) blueLineRotation += 360;
    applyBlueLineRotation();
    debug(`旋轉藍線，當前角度: ${blueLineRotation}`);
  }
  
  // 調整透明度
  function adjustOpacity(delta) {
    currentOpacity = Math.max(0.1, Math.min(1.0, currentOpacity + delta));
    overlay.style.opacity = currentOpacity.toString();
    debug(`圖片透明度設為: ${currentOpacity}`);
  }
  
  // 切換疊加層顯示/隱藏
  function toggleVisibility() {
    isVisible = !isVisible;
    container.style.display = isVisible ? 'block' : 'none';
    debug(`圖片顯示狀態: ${isVisible ? '顯示' : '隱藏'}`);
  }
  
  // 清除所有線條的函式
  function clearAllLines() {
    while (lines.length > 0) {
      const line = lines.pop();
      if (line && line.parentNode) {
        line.parentNode.removeChild(line);
      }
    }
    debug('所有線條已清除');
  }
  
  // 設定拖曳功能 - 加入對 Ctrl 鍵的檢查
  container.addEventListener('mousedown', function(e) {
    debug(`滑鼠按下在羅盤上，Ctrl=${isCtrlPressed}`);
    
    if (isCtrlPressed) {
      // 按下 Ctrl 時執行畫線邏輯
      isDrawingLine = true;
      isDragging = false;
      
      // 計算相對於羅盤容器的座標
      const rect = container.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      
      // 建立新線條元素
      currentLine = document.createElement('div');
      currentLine.style.position = 'absolute';
      currentLine.style.backgroundColor = 'red';
      currentLine.style.height = '2px';
      currentLine.style.transformOrigin = '0 0';
      currentLine.style.zIndex = '10001';
      
      // 設置起始位置 - 相對於容器
      currentLine.style.left = startX + 'px';
      currentLine.style.top = startY + 'px';
      
      // 添加到線條容器
      linesContainer.appendChild(currentLine);
      
      e.preventDefault();
      e.stopPropagation(); // 阻止事件冒泡
    } else {
      // 沒有按 Ctrl 時執行羅盤拖曳邏輯
      isDragging = true;
      isDrawingLine = false;
      offsetX = e.clientX - container.offsetLeft;
      offsetY = e.clientY - container.offsetTop;
      container.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }, true);
  
  // 滑鼠移動事件
  document.addEventListener('mousemove', function(e) {
    // 畫線邏輯
    if (isDrawingLine && currentLine && isCtrlPressed) {
      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      // 計算線條長度和角度
      const dx = currentX - startX;
      const dy = currentY - startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      // 應用線條屬性
      currentLine.style.width = length + 'px';
      currentLine.style.transform = `rotate(${angle}deg)`;
      
      e.stopPropagation();
    }
    
    // 拖曳邏輯
    if (isDragging && !isDrawingLine) {
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      container.style.left = x + 'px';
      container.style.top = y + 'px';
    }
  }, true);
  
  // 滑鼠釋放完成線條或拖曳
  document.addEventListener('mouseup', function(e) {
    // 完成線條繪製
    if (isDrawingLine && currentLine) {
      lines.push(currentLine);
      debug('線條完成繪製');
      isDrawingLine = false;
      currentLine = null;
    }
    
    // 結束拖曳
    if (isDragging) {
      isDragging = false;
      container.style.cursor = 'move';
    }
  }, true);
  
  // 修復滾輪縮放功能
  container.addEventListener('wheel', function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    // 獲取容器的當前尺寸和位置
    const rect = container.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height;
    
    // 計算容器的中心點在頁面中的位置
    const centerX = rect.left + currentWidth / 2;
    const centerY = rect.top + currentHeight / 2;
    
    // 計算縮放比例
    const scale = e.deltaY > 0 ? 0.9 : 1.1;
    
    // 計算新尺寸
    const newWidth = Math.round(currentWidth * scale);
    const newHeight = Math.round(currentHeight * scale);
    
    // 計算新的位置，以保持中心點不變
    const newLeft = centerX - newWidth / 2;
    const newTop = centerY - newHeight / 2;
    
    // 設定新尺寸和位置
    container.style.width = newWidth + 'px';
    container.style.height = newHeight + 'px';
    container.style.left = newLeft + 'px';
    container.style.top = newTop + 'px';
    
    return false;
  }, { passive: false, capture: true });
  
  // 重新實作鍵盤事件處理 - 針對字母按鍵特別處理
  function handleKeyDown(e) {
    debug(`按鍵按下: ${e.key} (keyCode: ${e.keyCode}), 目前焦點元素:`, document.activeElement.tagName);

    if(!isVisible && e.key !== 'v' && e.key !== 'V') {
      debug("羅盤隱藏中，忽略按鍵");
      return;
    }

    // 確保按鍵能被偵測到 (即使是在輸入框中)
    const isInputElement = document.activeElement.tagName === 'INPUT' || 
                          document.activeElement.tagName === 'TEXTAREA' || 
                          document.activeElement.isContentEditable;
    
    // 如果焦點在輸入元素中，不處理字母按鍵
    if (isInputElement && /^[a-zA-Z]$/.test(e.key)) {
      debug("焦點在輸入元素上，略過字母按鍵處理");
      return;
    }

    // 更強力的按鍵處理 - 使用 switch 而非 if-else 鏈
    switch (e.key.toLowerCase()) {
      // 羵盤旋轉鍵
      case 'q':
        debug("Q鍵被按下，嘗試左旋羅盤 5 度");
        rotateOverlay(-5);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'e':
        debug("E鍵被按下，嘗試右旋羅盤 5 度");
        rotateOverlay(5);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'w':
        debug("W鍵被按下，嘗試左旋羅盤 1 度");
        rotateOverlay(-1);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'r':
        debug("R鍵被按下，嘗試右旋羅盤 1 度");
        rotateOverlay(1);
        e.preventDefault();
        e.stopPropagation();
        break;
      
      // 藍色十字線旋轉鍵
      case 'a':
        debug("A鍵被按下，藍色十字線左旋 5 度");
        rotateBlueLines(-5);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'd':
        debug("D鍵被按下，藍色十字線右旋 5 度");
        rotateBlueLines(5);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 's':
        debug("S鍵被按下，藍色十字線左旋 1 度");
        rotateBlueLines(-1);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'f':
        debug("F鍵被按下，藍色十字線右旋 1 度");
        rotateBlueLines(1);
        e.preventDefault();
        e.stopPropagation();
        break;
      
      // 透明度控制鍵
      case 'o':
        debug("O鍵被按下，提高透明度");
        adjustOpacity(0.1);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'p':
        debug("P鍵被按下，降低透明度");
        adjustOpacity(-0.1);
        e.preventDefault();
        e.stopPropagation();
        break;
      
      // 顯示/隱藏控制鍵
      case 'v':
        debug("V鍵被按下，切換顯示/隱藏");
        toggleVisibility();
        e.preventDefault();
        e.stopPropagation();
        break;
      
      // 清除線條鍵
      case 'c':
        debug("C鍵被按下，清除所有線條");
        clearAllLines();
        e.preventDefault();
        e.stopPropagation();
        break;

      // 方向鍵處理
      case 'arrowleft':
        const leftPos = parseInt(container.style.left) || 0;
        container.style.left = (leftPos - 1) + 'px';
        debug('羅盤向左移動一像素');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'arrowright':
        const rightPos = parseInt(container.style.left) || 0;
        container.style.left = (rightPos + 1) + 'px';
        debug('羅盤向右移動一像素');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'arrowup':
        const topPos = parseInt(container.style.top) || 0;
        container.style.top = (topPos - 1) + 'px';
        debug('羅盤向上移動一像素');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'arrowdown':
        const bottomPos = parseInt(container.style.top) || 0;
        container.style.top = (bottomPos + 1) + 'px';
        debug('羅盤向下移動一像素');
        e.preventDefault();
        e.stopPropagation();
        break;
      
      default:
        // 不處理其他按鍵
        break;
    }
  }

  // 移除所有現有的鍵盤事件監聽器
  document.removeEventListener('keydown', handleKeyDown, true);
  window.removeEventListener('keydown', handleKeyDown, true);
  
  // 同時在 document 和 window 層級添加事件監聽器，使用捕獲階段
  document.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keydown', handleKeyDown, true);
  
  // 添加全局焦點監聽，確保我們能追蹤焦點變化
  document.addEventListener('focus', function(e) {
    debug('焦點切換到元素:', e.target.tagName, e.target);
  }, true);

  // 建立按鍵功能提示元素
  const tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  tooltip.style.color = 'white';
  tooltip.style.padding = '10px';
  tooltip.style.borderRadius = '5px';
  tooltip.style.fontSize = '12px';
  tooltip.style.zIndex = '10000';
  tooltip.style.maxWidth = '300px';
  tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
  tooltip.style.display = 'none';
  tooltip.style.pointerEvents = 'none';
  
  // 設定提示內容
  tooltip.innerHTML = `
    <strong>羅盤控制快捷鍵</strong><br>
    <strong>快捷鍵若無反應，請將輸入法切為英文輸入</strong><br>
    <ul style="margin: 5px 0; padding-left: 20px;">
      <li>拖曳 - 滑鼠拖曳</li>
      <li>縮放 - 滑鼠滾輪</li>
      <li>羅盤左旋 (5度) - Q 鍵</li>
      <li>羅盤右旋 (5度) - E 鍵</li>
      <li>羅盤左旋 (1度) - W 鍵</li>
      <li>羅盤右旋 (1度) - R 鍵</li>
      <li>藍線左旋 (5度) - A 鍵</li>
      <li>藍線右旋 (5度) - D 鍵</li>
      <li>藍線左旋 (1度) - S 鍵</li>
      <li>藍線右旋 (1度) - F 鍵</li>
      <li>提高透明度 - O 鍵</li>
      <li>降低透明度 - P 鍵</li>
      <li>顯示/隱藏 - V 鍵</li>
      <li>畫線 - Ctrl + 滑鼠拖曳</li>
      <li>清除所有線條 - C 鍵</li>
      <li>移動羅盤 - 方向鍵 (1像素)</li>
    </ul>
  `;
  
  // 將提示元素添加到頁面
  document.body.appendChild(tooltip);
  
  // 設定工具提示顯示計時器
  let tooltipTimer = null;
  
  // 顯示工具提示，5秒後自動隱藏
  function showTooltip(e) {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
    tooltip.style.display = 'block';
    
    tooltipTimer = setTimeout(() => {
      tooltip.style.display = 'none';
      tooltipTimer = null;
    }, 5000);
  }
  
  // 隱藏工具提示
  function hideTooltip() {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      tooltipTimer = null;
    }
    tooltip.style.display = 'none';
  }
  
  // 修改工具提示的滑鼠事件處理
  container.addEventListener('mouseover', function(e) {
    showTooltip(e);
  });
  
  container.addEventListener('mouseout', function() {
    hideTooltip();
  });
  
  debug("羅盤及藍色十字線已新增");

  // 修改容器設置，使其可以獲得焦點
  container.tabIndex = 0; // 使元素可以接收鍵盤焦點
  container.style.outline = 'none'; // 移除焦點時的外框，保持美觀
  
  // 添加點擊事件來確保羅盤可以取得焦點
  container.addEventListener('mousedown', function(e) {    
    // 使用 setTimeout 確保在點擊事件完成後才執行焦點獲取
    setTimeout(() => {
      container.focus({ preventScroll: true });
      debug('羅盤已取得焦點');
    }, 50);
    
    // 如果正在按 Ctrl 繪製線條，不要執行後續程式碼
    if (isCtrlPressed) return;

    // 執行拖曳邏輯
    if (!isCtrlPressed) {
      isDragging = true;
      isDrawingLine = false;
      offsetX = e.clientX - container.offsetLeft;
      offsetY = e.clientY - container.offsetTop;
      container.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }, true);
  
  // 監聽焦點狀態變化，當羅盤失去焦點時，顯示提示
  container.addEventListener('blur', function() {
    debug('羅盤已失去焦點');
    
    // 可選：顯示小提示，提醒用戶點擊羅盤以啟用快捷鍵
    const focusReminder = document.createElement('div');
    focusReminder.style.position = 'absolute';
    focusReminder.style.top = '-30px';
    focusReminder.style.left = '0';
    focusReminder.style.backgroundColor = 'rgba(255, 204, 0, 0.8)';
    focusReminder.style.padding = '3px 8px';
    focusReminder.style.borderRadius = '3px';
    focusReminder.style.fontSize = '12px';
    focusReminder.style.whiteSpace = 'nowrap';
    focusReminder.textContent = '點擊羅盤以啟用快捷鍵';
    focusReminder.style.zIndex = '10005';
    focusReminder.style.pointerEvents = 'none';
    
    container.appendChild(focusReminder);
    
    // 3秒後自動移除提示
    setTimeout(() => {
      if (focusReminder.parentNode === container) {
        container.removeChild(focusReminder);
      }
    }, 3000);
  });
  
  // 添加全域按鍵處理，即使羅盤沒有焦點也能響應部分按鍵
  function handleGlobalKeyDown(e) {
    // 如果羅盤隱藏了，忽略按鍵
    if (container.style.display === 'none') return;
    
    // 點擊 V 鍵時總是顯示羅盤（即使羅盤沒有焦點）
    if ((e.key === 'v' || e.key === 'V') && !isInputElement(document.activeElement)) {
      debug("V 鍵被按下，嘗試顯示羅盤");
      if (!isVisible) {
        toggleVisibility();
        e.preventDefault();
        e.stopPropagation();
        
        // 顯示後自動聚焦到羅盤
        setTimeout(() => container.focus({ preventScroll: true }), 50);
      }
    }
  }
  
  // 檢查元素是否為輸入元素
  function isInputElement(element) {
    if (!element) return false;
    return element.tagName === 'INPUT' || 
           element.tagName === 'TEXTAREA' || 
           element.isContentEditable;
  }
  
  // 添加全域鍵盤事件
  window.addEventListener('keydown', handleGlobalKeyDown, true);
  
  // 應用初始焦點
  setTimeout(() => {
    container.focus({ preventScroll: true });
    debug('羅盤初始焦點已設置');
  }, 500);
  
  // 處理縮放功能
  function handleZoom(scale) {
    // 獲取容器的當前尺寸和位置
    const rect = container.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height;
    
    // 計算容器的中心點在頁面中的位置
    const centerX = rect.left + currentWidth / 2;
    const centerY = rect.top + currentHeight / 2;
    
    // 計算新尺寸
    const newWidth = Math.round(currentWidth * scale);
    const newHeight = Math.round(currentHeight * scale);
    
    // 計算新的位置，以保持中心點不變
    const newLeft = centerX - newWidth / 2;
    const newTop = centerY - newHeight / 2;
    
    // 設定新尺寸和位置
    container.style.width = newWidth + 'px';
    container.style.height = newHeight + 'px';
    container.style.left = newLeft + 'px';
    container.style.top = newTop + 'px';
  }

  // 修改監聽來自 popup 的訊息處理機制
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    debug('收到訊息:', request);
    try {
      switch (request.action) {
        case 'getVisibility':
          sendResponse({ success: true, isVisible: isVisible });
          break;
        case 'toggleVisibility':
          toggleVisibility();
          // 在切換顯示狀態後，發送更新狀態的訊息到所有監聽者
          chrome.runtime.sendMessage({ action: 'visibilityChanged', isVisible: isVisible });
          sendResponse({ success: true });
          break;
        case 'rotateLuopan':
          rotateOverlay(request.degrees);
          break;
        case 'rotateBlueLines':
          rotateBlueLines(request.degrees);
          break;
        case 'adjustOpacity':
          adjustOpacity(request.delta);
          break;
        case 'clearAllLines':
          clearAllLines();
          break;
        case 'zoomLuoPan':
          handleZoom(request.scale);
          break;
      }
      sendResponse({ success: true });
    } catch (error) {
      console.error('執行操作失敗:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // 保持通道開啟以進行非同步回應
  });

  // 通知 background.js 擴充功能已就緒
  chrome.runtime.sendMessage({ action: 'extensionReady' });
});
