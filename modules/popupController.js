// 負責處理彈出視窗的邏輯
class PopupController {
    constructor() {
        this.controlButtons = [
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

        // 初始化時綁定 this 上下文
        this.handleSettingsClick = this.handleSettingsClick.bind(this);
        this.sendMessageToContent = this.sendMessageToContent.bind(this);
        this.updateButtonsVisibility = this.updateButtonsVisibility.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    // 初始化控制器
    initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeSettingsButton();
            this.initializeControlButtons();
            this.checkInitialVisibility();
            this.setupMessageListener();
        });
    }

    // 初始化設定按鈕
    initializeSettingsButton() {
        const settingsBtn = document.getElementById('openSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', this.handleSettingsClick);
        }
    }

    // 處理設定按鈕點擊
    handleSettingsClick(e) {
        e.preventDefault();
        try {
            chrome.runtime.openOptionsPage();
        } catch (err) {
            console.error('開啟選項頁面時發生錯誤:', err);
            const optionsUrl = chrome.runtime.getURL('options.html');
            chrome.tabs.create({ url: optionsUrl });
        }
    }

    // 傳送訊息到 content script
    async sendMessageToContent(action, data = {}) {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tabs || !tabs[0]) {
                throw new Error('找不到當前分頁');
            }

            try {
                const response = await this.sendMessage(tabs[0].id, action, data);
                if (response) {
                    console.log('Response from content script:', response);
                }
            } catch (error) {
                // 嘗試重新載入 content script
                await this.reloadContentScript(tabs[0].id, action, data);
            }
        } catch (error) {
            console.error('執行操作失敗:', error);
            alert('無法找到當前分頁，請確認分頁是否正常開啟。');
        }
    }

    // 傳送訊息的輔助函式
    sendMessage(tabId, action, data) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { action, ...data }, response => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // 重新載入 content script
    async reloadContentScript(tabId, action, data) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['content.js']
            });

            // 等待腳本載入
            await new Promise(resolve => setTimeout(resolve, 500));

            // 重試傳送訊息
            try {
                await this.sendMessage(tabId, action, data);
            } catch (error) {
                alert('請重新整理頁面後再試。如果問題持續發生，請確認：\n1. 網頁是否完全載入\n2. 擴充功能是否有權限存取此網頁');
            }
        } catch (error) {
            console.error('重新載入 content script 失敗:', error);
            alert('無法載入必要的程式碼，請重新安裝擴充功能。');
        }
    }

    // 更新按鈕顯示狀態
    updateButtonsVisibility(isVisible) {
        this.controlButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.style.display = isVisible ? 'inline-block' : 'none';
            }
        });
    }

    // 檢查初始可見性狀態
    async checkInitialVisibility() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tabs || !tabs[0]) return;

            const response = await this.sendMessage(tabs[0].id, 'getVisibility');
            if (response && response.success) {
                this.updateButtonsVisibility(response.isVisible);
            }
        } catch (error) {
            console.error('檢查可見性狀態失敗:', error);
        }
    }

    // 設定訊息監聽器
    setupMessageListener() {
        chrome.runtime.onMessage.addListener(this.handleVisibilityChange);
    }

    // 處理可見性變更事件
    handleVisibilityChange(request, sender, sendResponse) {
        if (request.action === 'visibilityChanged') {
            this.updateButtonsVisibility(request.isVisible);
        }
    }

    // 初始化控制按鈕
    initializeControlButtons() {
        // 羅盤旋轉控制
        this.setupRotationControls();
        // 藍線旋轉控制
        this.setupBlueLineControls();
        // 其他控制
        this.setupOtherControls();
    }

    // 設定羅盤旋轉控制
    setupRotationControls() {
        const rotationControls = {
            'rotateLuopanLeft5': { action: 'rotateLuopan', degrees: -5 },
            'rotateLuopanRight5': { action: 'rotateLuopan', degrees: 5 },
            'rotateLuopanLeft1': { action: 'rotateLuopan', degrees: -1 },
            'rotateLuopanRight1': { action: 'rotateLuopan', degrees: 1 }
        };

        Object.entries(rotationControls).forEach(([id, config]) => {
            document.getElementById(id)?.addEventListener('click', 
                () => this.sendMessageToContent(config.action, { degrees: config.degrees }));
        });
    }

    // 設定藍線旋轉控制
    setupBlueLineControls() {
        const blueLineControls = {
            'rotateBlueLeft5': { degrees: -5 },
            'rotateBlueRight5': { degrees: 5 },
            'rotateBlueLeft1': { degrees: -1 },
            'rotateBlueRight1': { degrees: 1 }
        };

        Object.entries(blueLineControls).forEach(([id, config]) => {
            document.getElementById(id)?.addEventListener('click',
                () => this.sendMessageToContent('rotateBlueLines', { degrees: config.degrees }));
        });
    }

    // 設定其他控制
    setupOtherControls() {
        // 透明度控制
        document.getElementById('increaseOpacity')?.addEventListener('click',
            () => this.sendMessageToContent('adjustOpacity', { delta: 0.1 }));
        document.getElementById('decreaseOpacity')?.addEventListener('click',
            () => this.sendMessageToContent('adjustOpacity', { delta: -0.1 }));

        // 切換顯示/隱藏
        document.getElementById('toggleButton')?.addEventListener('click',
            () => this.sendMessageToContent('toggleVisibility'));

        // 清除線條
        document.getElementById('clearLines')?.addEventListener('click',
            () => this.sendMessageToContent('clearAllLines'));

        // 縮放控制
        document.getElementById('zoomIn')?.addEventListener('click',
            () => this.sendMessageToContent('zoomLuoPan', { scale: 1.1 }));
        document.getElementById('zoomOut')?.addEventListener('click',
            () => this.sendMessageToContent('zoomLuoPan', { scale: 0.9 }));
    }
}

// 對外公開實例
window.LuopanPopupController = new PopupController();