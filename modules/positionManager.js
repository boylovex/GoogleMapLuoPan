// 負責管理羅盤位置與尺寸

class PositionManager {
    constructor() {
        this.initialWidth = 200;
        this.initialHeight = 200;
        this.debug = window.LuopanCore.debug;
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
        // 使用 clientWidth 和 clientHeight 來獲取可視區域大小
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        
        const centerX = Math.max(0, (viewportWidth - this.initialWidth) / 2);
        const centerY = Math.max(0, (viewportHeight - this.initialHeight) / 2);
        
        container.style.top = centerY + 'px';
        container.style.left = centerX + 'px';
        
        this.debug(`更新羅盤位置至: (${centerX}, ${centerY})`);
    }
    
    // 處理縮放
    handleZoom(container, scale) {
        const rect = container.getBoundingClientRect();
        
        const currentWidth = rect.width;
        const currentHeight = rect.height;
        const centerX = rect.left + currentWidth / 2;
        const centerY = rect.top + currentHeight / 2;
        
        const newWidth = Math.round(currentWidth * scale);
        const newHeight = Math.round(currentHeight * scale);
        const newLeft = centerX - newWidth / 2;
        const newTop = centerY - newHeight / 2;
        
        container.style.width = newWidth + 'px';
        container.style.height = newHeight + 'px';
        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';
        
        this.debug(`羅盤縮放: ${scale}, 新尺寸: ${newWidth}x${newHeight}`);
    }
}

// 對外公開位置管理器
window.LuopanPositionManager = new PositionManager();