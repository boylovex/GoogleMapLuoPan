// 負責處理設定頁面的邏輯
class OptionsController {
    constructor() {
        this.imageChanged = false;
        this.settingsChanged = false;
        this.imageDataUrl = null;

        // 綁定 this 上下文
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.handleDebugModeChange = this.handleDebugModeChange.bind(this);
        this.handleUseDefaultClick = this.handleUseDefaultClick.bind(this);
        this.handleSaveClick = this.handleSaveClick.bind(this);
    }

    // 初始化控制器
    initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.loadSettings();
            this.setupEventListeners();
        });
    }

    // 初始化 DOM 元素參考
    initializeElements() {
        this.fileInput = document.getElementById('customImage');
        this.imagePreview = document.getElementById('imagePreview');
        this.saveButton = document.getElementById('saveButton');
        this.useDefaultButton = document.getElementById('useDefault');
        this.statusMessage = document.getElementById('statusMessage');
        this.debugModeCheckbox = document.getElementById('debugMode');
    }

    // 載入已儲存的設定
    loadSettings() {
        chrome.storage.local.get(['customImageData', 'useDefaultImage', 'debugMode'], result => {
            if (result.customImageData && !result.useDefaultImage) {
                this.imagePreview.src = result.customImageData;
                this.imageDataUrl = result.customImageData;
            } else {
                this.imagePreview.src = 'LuoPan.png';
                this.imageDataUrl = null;
            }
            this.debugModeCheckbox.checked = result.debugMode || false;
        });
    }

    // 設定事件監聽器
    setupEventListeners() {
        this.fileInput.addEventListener('change', this.handleFileSelect);
        this.debugModeCheckbox.addEventListener('change', this.handleDebugModeChange);
        this.useDefaultButton.addEventListener('click', this.handleUseDefaultClick);
        this.saveButton.addEventListener('click', this.handleSaveClick);
    }

    // 處理檔案選擇
    async handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            this.showStatus('圖片檔案大小不能超過 2MB', 'error');
            return;
        }

        try {
            this.imageDataUrl = await this.readFileAsDataURL(file);
            this.imagePreview.src = this.imageDataUrl;
            this.imageChanged = true;
        } catch (error) {
            this.showStatus('讀取圖片失敗', 'error');
        }
    }

    // 檔案讀取輔助函式
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('檔案讀取失敗'));
            reader.readAsDataURL(file);
        });
    }

    // 處理除錯模式變更
    handleDebugModeChange() {
        this.settingsChanged = true;
    }

    // 處理使用預設圖片按鈕點擊
    handleUseDefaultClick() {
        this.imagePreview.src = 'LuoPan.png';
        this.imageDataUrl = null;
        this.imageChanged = true;
        this.showStatus('已設定為使用預設圖片', 'success');
    }

    // 處理儲存按鈕點擊
    handleSaveClick() {
        if (!this.imageChanged && !this.settingsChanged) {
            this.showStatus('尚未進行任何變更', 'error');
            return;
        }

        const data = {
            customImageData: this.imageDataUrl,
            useDefaultImage: this.imageDataUrl === null,
            lastUpdated: new Date().toISOString(),
            debugMode: this.debugModeCheckbox.checked
        };

        this.saveSettings(data);
    }

    // 儲存設定
    saveSettings(data) {
        chrome.storage.local.set(data, () => {
            if (chrome.runtime.lastError) {
                this.showStatus('儲存失敗: ' + chrome.runtime.lastError.message, 'error');
            } else {
                this.showStatus('設定已儲存成功！重新開啟 Google Maps 頁面以套用變更。', 'success');
                this.imageChanged = false;
                this.settingsChanged = false;
            }
        });
    }

    // 顯示狀態訊息
    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'status ' + type;
        this.statusMessage.style.display = 'block';
        setTimeout(() => {
            this.statusMessage.style.display = 'none';
        }, 5000);
    }
}

// 對外公開實例
window.LuopanOptionsController = new OptionsController();