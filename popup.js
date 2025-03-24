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
      if (!tabs || !tabs[0]) {
        console.error('找不到當前分頁');
        alert('無法找到當前分頁，請確認分頁是否正常開啟。');
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, {
        action: action,
        ...data
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('通訊錯誤:', chrome.runtime.lastError);
          // 檢查是否需要重新載入 content script
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
          }).then(() => {
            // 重新嘗試傳送訊息
            setTimeout(() => {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: action,
                ...data
              }, function(retryResponse) {
                if (chrome.runtime.lastError) {
                  alert('請重新整理頁面後再試。如果問題持續發生，請確認：\n1. 網頁是否完全載入\n2. 擴充功能是否有權限存取此網頁');
                }
              });
            }, 500);
          }).catch(err => {
            console.error('重新載入 content script 失敗:', err);
            alert('無法載入必要的程式碼，請重新安裝擴充功能。');
          });
          return;
        }
        if (response) {
          console.log('Response from content script:', response);
        }
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
