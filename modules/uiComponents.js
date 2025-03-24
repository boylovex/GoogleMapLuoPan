// 負責建立各種 UI 元件
class UIComponentsBuilder {
    constructor() {
        this.debug = window.LuopanCore.debug;
    }

    // 建立主容器
    createMainContainer(isVisible) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.display = isVisible ? 'block' : 'none';
        container.style.outline = 'none';
        container.tabIndex = -1;
        container.style.userSelect = 'none';
        container.style.webkitUserSelect = 'none';
        container.id = 'luopanContainer';
        container.style.zIndex = '2147483647';
        container.style.cursor = 'move';
        
        return container;
    }

    // 建立羅盤圖片元件
    createOverlay(callback) {
        const overlay = document.createElement('img');
        overlay.style.position = 'absolute';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.opacity = '0.8';
        overlay.id = 'luopanOverlay';
        
        // 從儲存空間載入自訂圖片
        chrome.storage.local.get(['customImageData', 'useDefaultImage'], (result) => {
            if (result.customImageData && !result.useDefaultImage) {
                this.debug("使用自訂羅盤圖片");
                overlay.src = result.customImageData;
            } else {
                const overlayUrl = chrome.runtime.getURL("LuoPan.png");
                this.debug("使用預設羅盤圖片: " + overlayUrl);
                overlay.src = overlayUrl;
            }
            
            overlay.onerror = () => {
                console.error("圖片載入失敗，使用預設圖片");
                overlay.src = chrome.runtime.getURL("LuoPan.png");
            };

            if (callback) callback(overlay);
        });
        
        return overlay;
    }

    // 建立黑色十字線容器
    createBlackCrossContainer() {
        const container = document.createElement('div');
        container.id = 'blackCrossContainer';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.top = '0';
        container.style.left = '0';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '2147483646';
        
        // 建立十字線
        const horizontalLine = this.createLine('black', true);
        const verticalLine = this.createLine('black', false);
        
        container.appendChild(horizontalLine);
        container.appendChild(verticalLine);
        
        return container;
    }

    // 建立藍色十字線容器
    createBlueCrossContainer() {
        const container = document.createElement('div');
        container.id = 'blueCrossContainer';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.top = '0';
        container.style.left = '0';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '2147483645';
        
        // 建立十字線
        const horizontalLine = this.createLine('blue', true);
        const verticalLine = this.createLine('blue', false);
        
        container.appendChild(horizontalLine);
        container.appendChild(verticalLine);
        
        return container;
    }

    // 建立線條 (通用函式)
    createLine(color, isHorizontal) {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.backgroundColor = color;
        
        if (isHorizontal) {
            line.style.width = '100%';
            line.style.height = '2px';
            line.style.top = '50%';
            line.style.left = '0';
            line.style.transform = 'translateY(-50%)';
        } else {
            line.style.width = '2px';
            line.style.height = '100%';
            line.style.top = '0';
            line.style.left = '50%';
            line.style.transform = 'translateX(-50%)';
        }
        
        line.style.pointerEvents = 'none';
        line.style.opacity = '1';
        
        return line;
    }

    // 建立線條容器
    createLinesContainer() {
        const container = document.createElement('div');
        container.id = 'luopanLinesContainer';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '2147483644';
        
        return container;
    }

    // 建立焦點提醒元件
    createFocusReminder() {
        const reminder = document.createElement('div');
        reminder.style.position = 'absolute';
        reminder.style.top = '-30px';
        reminder.style.left = '0';
        reminder.style.backgroundColor = 'rgba(255, 204, 0, 0.8)';
        reminder.style.padding = '3px 8px';
        reminder.style.borderRadius = '3px';
        reminder.style.fontSize = '12px';
        reminder.style.whiteSpace = 'nowrap';
        reminder.textContent = '點擊羅盤以啟用快捷鍵';
        reminder.style.zIndex = '2147483647';
        reminder.style.pointerEvents = 'none';
        
        return reminder;
    }

    // 建立角度顯示元件
    createAngleDisplay() {
        const angleDisplay = document.createElement('div');
        angleDisplay.id = 'angleDisplay';
        angleDisplay.style.position = 'absolute';
        angleDisplay.style.top = '-25px';
        angleDisplay.style.left = '50%';
        angleDisplay.style.transform = 'translateX(-50%)';
        angleDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        angleDisplay.style.color = 'white';
        angleDisplay.style.padding = '2px 8px';
        angleDisplay.style.borderRadius = '4px';
        angleDisplay.style.fontSize = '12px';
        angleDisplay.style.zIndex = '2147483647';
        angleDisplay.style.pointerEvents = 'none';
        angleDisplay.textContent = '0°';
        
        return angleDisplay;
    }

    // 更新角度顯示
    updateAngleDisplay(container, angle) {
        const angleDisplay = container.querySelector('#angleDisplay');
        if (angleDisplay) {
            angleDisplay.textContent = `${Math.round(angle)}°`;
        }
    }

    // 設定元件尺寸和位置
    setComponentSize(component, width, height) {
        component.style.width = width + 'px';
        component.style.height = height + 'px';
    }

    // 設定元件位置
    setComponentPosition(component, left, top) {
        component.style.left = left + 'px';
        component.style.top = top + 'px';
    }
}

// 對外公開建構器
window.LuopanUIComponents = new UIComponentsBuilder();