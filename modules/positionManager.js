// 位置與尺寸設定介面
class PositionConfig {
    constructor(initialWidth = 200, initialHeight = 200, minScale = 0.1, maxScale = 5.0) {
        this.initialWidth = initialWidth;
        this.initialHeight = initialHeight;
        this.minScale = minScale;
        this.maxScale = maxScale;
    }
}

// 負責管理羅盤位置與尺寸
class PositionManager {
    constructor(config = new PositionConfig()) {
        this.config = config;
        this.currentScale = 1.0;
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
        this.container = container;
        this.updatePosition();
        this.setInitialSize();
        this.setupResizeListener();
    }
    
    // 設定初始尺寸
    setInitialSize() {
        if (!this.container) return;
        this.container.style.width = this.config.initialWidth + 'px';
        this.container.style.height = this.config.initialHeight + 'px';
    }
    
    // 設定視窗大小變更監聽
    setupResizeListener() {
        window.addEventListener('resize', () => this.updatePosition());
    }
    
    // 更新羅盤位置到畫面中心
    updatePosition() {
        if (!this.container) return;

        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        
        const centerX = Math.max(0, (viewportWidth - this.config.initialWidth) / 2);
        const centerY = Math.max(0, (viewportHeight - this.config.initialHeight) / 2);
        
        this.container.style.top = centerY + 'px';
        this.container.style.left = centerX + 'px';
        
        if (this.debug) {
            this.debug(`更新羅盤位置至: (${centerX}, ${centerY})`);
        }
    }
    
    // 處理縮放
    handleZoom(container, scale) {
        const newScale = this.currentScale * scale;
        
        // 檢查縮放限制
        if (newScale < this.config.minScale || newScale > this.config.maxScale) {
            this.debug(`縮放超出範圍: ${newScale}`);
            return;
        }
        
        this.currentScale = newScale;
        this.applyZoom(container);
    }
    
    // 套用縮放
    applyZoom(container) {
        const rect = container.getBoundingClientRect();
        
        // 計算新尺寸
        const newWidth = Math.round(this.config.initialWidth * this.currentScale);
        const newHeight = Math.round(this.config.initialHeight * this.currentScale);
        
        // 計算新位置，保持中心點不變
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const newLeft = centerX - newWidth / 2;
        const newTop = centerY - newHeight / 2;
        
        // 套用新的尺寸和位置
        this.setContainerSize(container, newWidth, newHeight);
        this.setContainerPosition(container, newLeft, newTop);
        
        if (this.debug) {
            this.debug(`羅盤縮放: 比例=${this.currentScale}, 尺寸=${newWidth}x${newHeight}`);
        }
    }
    
    // 設定容器尺寸
    setContainerSize(container, width, height) {
        container.style.width = width + 'px';
        container.style.height = height + 'px';
    }
    
    // 設定容器位置
    setContainerPosition(container, left, top) {
        container.style.left = left + 'px';
        container.style.top = top + 'px';
    }
    
    // 取得目前縮放比例
    getCurrentScale() {
        return this.currentScale;
    }
    
    // 重設縮放比例
    resetScale() {
        this.currentScale = 1.0;
        if (this.container) {
            this.applyZoom(this.container);
        }
    }
}

// 對外公開介面和實例
window.LuopanPositionManager = new PositionManager();
window.LuopanPositionConfig = PositionConfig;