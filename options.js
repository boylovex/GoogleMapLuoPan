// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('customImage');
  const imagePreview = document.getElementById('imagePreview');
  const saveButton = document.getElementById('saveButton');
  const useDefaultButton = document.getElementById('useDefault');
  const statusMessage = document.getElementById('statusMessage');
  
  let imageChanged = false;
  let imageDataUrl = null;

  // 載入已儲存的圖片（如果有）
  chrome.storage.local.get(['customImageData', 'useDefaultImage'], function(result) {
    if (result.customImageData && !result.useDefaultImage) {
      imagePreview.src = result.customImageData;
      imageDataUrl = result.customImageData;
    } else {
      // 使用預設圖片
      imagePreview.src = 'LuoPan.png';
      imageDataUrl = null;
    }
  });

  // 監聽檔案選擇
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showStatus('圖片檔案大小不能超過 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      imageDataUrl = event.target.result;
      imagePreview.src = imageDataUrl;
      imageChanged = true;
    };
    reader.onerror = function() {
      showStatus('讀取圖片失敗', 'error');
    };
    reader.readAsDataURL(file);
  });

  // 恢復預設圖片
  useDefaultButton.addEventListener('click', function() {
    imagePreview.src = 'LuoPan.png';
    imageDataUrl = null;
    imageChanged = true;
    showStatus('已設定為使用預設圖片', 'success');
  });

  // 儲存設定
  saveButton.addEventListener('click', function() {
    if (!imageChanged) {
      showStatus('尚未選擇新圖片或更改設定', 'error');
      return;
    }

    const data = {
      customImageData: imageDataUrl,
      useDefaultImage: imageDataUrl === null,
      lastUpdated: new Date().toISOString()
    };

    chrome.storage.local.set(data, function() {
      if (chrome.runtime.lastError) {
        showStatus('儲存失敗: ' + chrome.runtime.lastError.message, 'error');
      } else {
        showStatus('設定已儲存成功！重新開啟 Google Maps 頁面以套用變更。', 'success');
        imageChanged = false;
      }
    });
  });

  // 顯示狀態訊息
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status ' + type;
    statusMessage.style.display = 'block';
    setTimeout(function() {
      statusMessage.style.display = 'none';
    }, 5000);
  }
});
