// 等待 DOM 載入完成
document.addEventListener('DOMContentLoaded', function() {
  const settingsBtn = document.getElementById('openSettings');
  const controlButtons = [
    'rotateLuopanLeft5',
    'rotateLuopanRight5',
    'rotateLuopanLeft1',
    'rotateLuopanRight1',
    'rotateBlueLeft5',
    'rotateBlueRight5',
    'rotateBlueLeft1',
    'rotateBlueRight1',
    'increaseOpacity',
    'decreaseOpacity',
    'clearLines',
    'zoomIn',
    'zoomOut'
  ];
  
  // 設定按鈕事件處理
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      try {
        chrome.runtime.openOptionsPage();
      } catch (err) {
        console.error('開啟選項頁面時發生錯誤:', err);
        const optionsUrl = chrome.runtime.getURL('options.html');
        chrome.tabs.create({ url: optionsUrl });
      }
    });
  }

  // 通用函式：傳送訊息到 content script
  function sendMessageToContent(action, data = {}) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: action,
        ...data
      }, function(response) {
        console.log('Response from content script:', response);
        if (chrome.runtime.lastError) {
          alert('無法與目前頁面通訊，請重新整理頁面後再試。');
          return;
        }
        return true;
      });
    });
  }

  // 更新按鈕顯示狀態
  function updateButtonsVisibility(isVisible) {
    controlButtons.forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.style.display = isVisible ? 'inline-block' : 'none';
      }
    });
  }

  // 初始化時檢查羅盤顯示狀態
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getVisibility' }, function(response) {
      if (!chrome.runtime.lastError && response && response.success) {
        updateButtonsVisibility(response.isVisible);
      }
    });
  });

  // 監聽羅盤顯示狀態變化
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'visibilityChanged') {
      updateButtonsVisibility(request.isVisible);
    }
  });

  // 羅盤旋轉控制
  document.getElementById('rotateLuopanLeft5')?.addEventListener('click', () => sendMessageToContent('rotateLuopan', { degrees: -5 }));
  document.getElementById('rotateLuopanRight5')?.addEventListener('click', () => sendMessageToContent('rotateLuopan', { degrees: 5 }));
  document.getElementById('rotateLuopanLeft1')?.addEventListener('click', () => sendMessageToContent('rotateLuopan', { degrees: -1 }));
  document.getElementById('rotateLuopanRight1')?.addEventListener('click', () => sendMessageToContent('rotateLuopan', { degrees: 1 }));

  // 藍線旋轉控制
  document.getElementById('rotateBlueLeft5')?.addEventListener('click', () => sendMessageToContent('rotateBlueLines', { degrees: -5 }));
  document.getElementById('rotateBlueRight5')?.addEventListener('click', () => sendMessageToContent('rotateBlueLines', { degrees: 5 }));
  document.getElementById('rotateBlueLeft1')?.addEventListener('click', () => sendMessageToContent('rotateBlueLines', { degrees: -1 }));
  document.getElementById('rotateBlueRight1')?.addEventListener('click', () => sendMessageToContent('rotateBlueLines', { degrees: 1 }));

  // 透明度控制
  document.getElementById('increaseOpacity')?.addEventListener('click', () => sendMessageToContent('adjustOpacity', { delta: 0.1 }));
  document.getElementById('decreaseOpacity')?.addEventListener('click', () => sendMessageToContent('adjustOpacity', { delta: -0.1 }));

  // 切換顯示/隱藏
  document.getElementById('toggleButton')?.addEventListener('click', () => sendMessageToContent('toggleVisibility'));

  // 清除線條
  document.getElementById('clearLines')?.addEventListener('click', () => sendMessageToContent('clearAllLines'));

  // 處理縮放按鈕
  document.getElementById('zoomIn')?.addEventListener('click', () => sendMessageToContent('zoomLuoPan', { scale: 1.1 }));
  document.getElementById('zoomOut')?.addEventListener('click', () => sendMessageToContent('zoomLuoPan', { scale: 0.9 }));
});
