// 負責管理羅盤位置與尺寸
class PositionManager {
    constructor() {
        this.initialWidth = 200;
        this.initialHeight = 200;
        
        // 等待核心模組初始化
        this.waitForCore();
    }
    
    // 等待核心模組載入
    waitForCore() {
        if (window.LuopanCore && window.LuopanCore.debug) {
            this.debug = window.LuopanCore.debug;
            window.LuopanCore.initDebugMode();
        } else {
            setTimeout(() => this.waitForCore(), 100);
        }
    }
    
    // 初始化並設定位置
    initPosition(container) {
        // 設定羅盤位於畫面中間
        this.updatePosition(container);
        
        // 設定初始尺寸
        container.style.width = this.initialWidth + 'px';
        container.style.height = this.initialHeight + 'px';
        
        // 監聽視窗大小變更
        window.addEventListener('resize', () => this.updatePosition(container));
    }
    
    // 更新羅盤位置到畫面中心
    updatePosition(container) {
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        
        const centerX = Math.max(0, (viewportWidth - this.initialWidth) / 2);
        const centerY = Math.max(0, (viewportHeight - this.initialHeight) / 2);
        
        container.style.top = centerY + 'px';
        container.style.left = centerX + 'px';
        
        if (this.debug) {
            this.debug(`更新羅盤位置至: (${centerX}, ${centerY})`);
        }
    }
    
    // 處理縮放
    handleZoom(container, scale) {
        const rect = container.getBoundingClientRect();
        
        // 取得目前尺寸
        const currentWidth = rect.width;
        const currentHeight = rect.height;
        
        // 計算中心點
        const centerX = rect.left + currentWidth / 2;
        const centerY = rect.top + currentHeight / 2;
        
        // 計算新尺寸
        const newWidth = Math.round(currentWidth * scale);
        const newHeight = Math.round(currentHeight * scale);
        
        // 計算新位置（保持中心點不變）
        const newLeft = centerX - newWidth / 2;
        const newTop = centerY - newHeight / 2;
        
        // 設定新的尺寸和位置
        container.style.width = newWidth + 'px';
        container.style.height = newHeight + 'px';
        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';
        
        if (this.debug) {
            this.debug(`羅盤縮放: ${scale}, 新尺寸: ${newWidth}x${newHeight}`);
        }
    }
}

// 對外公開位置管理器實例
window.LuopanPositionManager = new PositionManager();