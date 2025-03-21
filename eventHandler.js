// 事件處理類別
class LuopanEventHandler {
    constructor(container, overlay, blackLineContainer, blueLineContainer) {
        // 儲存DOM元件的參考
        this.container = container;
        this.overlay = overlay;
        this.blackLineContainer = blackLineContainer;
        this.blueLineContainer = blueLineContainer;
        
        // 狀態追蹤
        this.currentRotation = 0;
        this.blueLineRotation = 0;
        this.currentOpacity = 0.8;
        this.isVisible = false;
        
        // 拖曳相關狀態
        this.isDragging = false;
        this.isDrawingLine = false;
        this.isCtrlPressed = false;
        this.lines = [];
        this.startX = 0;
        this.startY = 0;
        this.currentLine = null;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // 取得除錯函式
        this.debug = window.LuopanCore.debug;
        
        // 初始化事件
        this.initializeEventListeners();
    }

    // 初始化所有事件監聽器
    initializeEventListeners() {
        // 全域按鍵事件
        window.addEventListener('keydown', this.handleGlobalKeyDown.bind(this), true);
        window.addEventListener('keyup', this.handleKeyUp.bind(this), true);
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        
        // 滑鼠事件
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
        document.addEventListener('mouseup', this.handleMouseUp.bind(this), true);
        
        // 滾輪事件
        this.container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false, capture: true });
        
        // 焦點事件
        this.container.addEventListener('blur', this.handleBlur.bind(this));
        
        this.debug('事件監聽器已初始化');
    }

    // 處理全域按鍵事件
    handleGlobalKeyDown(e) {
        if (this.container.style.display === 'none') return;
        
        if ((e.key === 'v' || e.key === 'V') && !this.isInputElement(document.activeElement)) {
            if (!this.isVisible) {
                this.toggleVisibility();
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => this.container.focus({ preventScroll: true }), 50);
            }
        }
        
        // 偵測 Ctrl 按鍵
        if (e.key === 'Control' && this.isVisible) {
            this.isCtrlPressed = true;
            if (!this.isDragging) {
                this.container.style.cursor = 'crosshair';
                this.debug('已啟用畫線模式');
            }
        }
    }

    // 判斷是否為輸入元件
    isInputElement(element) {
        if (!element) return false;
        return element.tagName === 'INPUT' || 
               element.tagName === 'TEXTAREA' || 
               element.isContentEditable;
    }

    // 按鍵處理
    handleKeyDown(e) {
        const isInputElement = document.activeElement.tagName === 'INPUT' || 
                             document.activeElement.tagName === 'TEXTAREA' || 
                             document.activeElement.isContentEditable;

        if (e.altKey || e.shiftKey || e.ctrlKey) return;
        if (!this.isVisible && e.key.toLowerCase() !== 'v') return;
        if (isInputElement) return;

        this.handleKeyboardShortcuts(e);
    }

    // 處理鍵盤快捷鍵
    handleKeyboardShortcuts(e) {
        switch (e.key.toLowerCase()) {
            case 'q': this.rotateOverlay(-5); break;
            case 'e': this.rotateOverlay(5); break;
            case 'w': this.rotateOverlay(-1); break;
            case 'r': this.rotateOverlay(1); break;
            case 'a': this.rotateBlueLines(-5); break;
            case 'd': this.rotateBlueLines(5); break;
            case 's': this.rotateBlueLines(-1); break;
            case 'f': this.rotateBlueLines(1); break;
            case 'o': this.adjustOpacity(0.1); break;
            case 'p': this.adjustOpacity(-0.1); break;
            case 'v': this.toggleVisibility(); break;
            case 'c': this.clearAllLines(); break;
            case 'arrowleft': this.moveContainer(-1, 0); break;
            case 'arrowright': this.moveContainer(1, 0); break;
            case 'arrowup': this.moveContainer(0, -1); break;
            case 'arrowdown': this.moveContainer(0, 1); break;
        }
        e.preventDefault();
        e.stopPropagation();
        this.debug(`快捷鍵 '${e.key}' 已處理`);
    }

    // 滑鼠按下事件
    handleMouseDown(e) {
        setTimeout(() => {
            this.container.focus({ preventScroll: true });
        }, 50);

        if (this.isCtrlPressed) {
            this.startDrawing(e);
        } else {
            this.startDragging(e);
        }
    }

    // 開始繪製線條
    startDrawing(e) {
        this.isDrawingLine = true;
        this.isDragging = false;
        
        const rect = this.container.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        this.currentLine = document.createElement('div');
        this.currentLine.style.position = 'absolute';
        this.currentLine.style.backgroundColor = 'red';
        this.currentLine.style.height = '2px';
        this.currentLine.style.transformOrigin = '0 0';
        this.currentLine.style.zIndex = '10001';
        this.currentLine.style.left = this.startX + 'px';
        this.currentLine.style.top = this.startY + 'px';
        
        this.container.querySelector('#luopanLinesContainer').appendChild(this.currentLine);
        
        e.preventDefault();
        e.stopPropagation();
        this.debug(`開始畫線: (${this.startX}, ${this.startY})`);
    }

    // 開始拖曳
    startDragging(e) {
        this.isDragging = true;
        this.isDrawingLine = false;
        this.offsetX = e.clientX - this.container.offsetLeft;
        this.offsetY = e.clientY - this.container.offsetTop;
        this.container.style.cursor = 'grabbing';
        e.preventDefault();
        this.debug('開始拖曳羅盤');
    }

    // 滑鼠移動事件
    handleMouseMove(e) {
        if (this.isDrawingLine && this.currentLine && this.isCtrlPressed) {
            this.updateDrawingLine(e);
        } else if (this.isDragging && !this.isDrawingLine) {
            this.updateDragging(e);
        }
    }

    // 更新線條繪製
    updateDrawingLine(e) {
        const rect = this.container.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const dx = currentX - this.startX;
        const dy = currentY - this.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        this.currentLine.style.width = length + 'px';
        this.currentLine.style.transform = `rotate(${angle}deg)`;
        
        e.stopPropagation();
    }

    // 更新拖曳位置
    updateDragging(e) {
        const x = e.clientX - this.offsetX;
        const y = e.clientY - this.offsetY;
        this.container.style.left = x + 'px';
        this.container.style.top = y + 'px';
    }

    // 滑鼠釋放事件
    handleMouseUp(e) {
        if (this.isDrawingLine && this.currentLine) {
            this.lines.push(this.currentLine);
            this.isDrawingLine = false;
            this.currentLine = null;
            this.debug('線條繪製完成');
        }
        
        if (this.isDragging) {
            this.isDragging = false;
            this.container.style.cursor = this.isCtrlPressed ? 'crosshair' : 'move';
            this.debug('結束拖曳');
        }
    }

    // 滾輪事件處理
    handleWheel(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const scale = e.deltaY > 0 ? 0.9 : 1.1;
        const rect = this.container.getBoundingClientRect();
        
        // 使用位置管理器處理縮放
        window.LuopanPositionManager.handleZoom(this.container, scale);
        
        return false;
    }

    // Ctrl 鍵釋放事件
    handleKeyUp(e) {
        if (e.key === 'Control' && this.isVisible) {
            this.isCtrlPressed = false;
            if (!this.isDragging) {
                this.container.style.cursor = 'move';
                this.debug('已退出畫線模式');
            }
        }
    }

    // 失去焦點事件
    handleBlur() {
        this.showFocusReminder();
    }

    // 顯示焦點提醒
    showFocusReminder() {
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
        focusReminder.style.zIndex = '2147483647';
        focusReminder.style.pointerEvents = 'none';
        
        this.container.appendChild(focusReminder);
        
        setTimeout(() => {
            if (focusReminder.parentNode === this.container) {
                this.container.removeChild(focusReminder);
            }
        }, 3000);
    }

    // 旋轉羅盤
    rotateOverlay(degrees) {
        this.currentRotation = (this.currentRotation + degrees) % 360;
        if (this.currentRotation < 0) this.currentRotation += 360;
        this.overlay.style.transform = `rotate(${this.currentRotation}deg)`;
        this.blackLineContainer.style.transform = `rotate(${this.currentRotation}deg)`;
        this.debug(`羅盤旋轉至: ${this.currentRotation}度`);
    }

    // 旋轉藍線
    rotateBlueLines(degrees) {
        this.blueLineRotation = (this.blueLineRotation + degrees) % 360;
        if (this.blueLineRotation < 0) this.blueLineRotation += 360;
        this.blueLineContainer.style.transform = `rotate(${this.blueLineRotation}deg)`;
        this.debug(`藍線旋轉至: ${this.blueLineRotation}度`);
    }

    // 調整透明度
    adjustOpacity(delta) {
        this.currentOpacity = Math.max(0.1, Math.min(1.0, this.currentOpacity + delta));
        this.overlay.style.opacity = this.currentOpacity.toString();
        this.debug(`羅盤透明度調整為: ${this.currentOpacity}`);
    }

    // 切換可見性
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
        this.debug(`羅盤可見性切換為: ${this.isVisible ? '顯示' : '隱藏'}`);
        chrome.runtime.sendMessage({ 
            action: 'visibilityChanged', 
            isVisible: this.isVisible 
        });
    }

    // 清除所有線條
    clearAllLines() {
        const linesContainer = this.container.querySelector('#luopanLinesContainer');
        while (this.lines.length > 0) {
            const line = this.lines.pop();
            if (line && line.parentNode) {
                line.parentNode.removeChild(line);
            }
        }
        this.debug('所有線條已清除');
    }

    // 移動容器
    moveContainer(deltaX, deltaY) {
        const currentLeft = parseInt(this.container.style.left) || 0;
        const currentTop = parseInt(this.container.style.top) || 0;
        this.container.style.left = (currentLeft + deltaX) + 'px';
        this.container.style.top = (currentTop + deltaY) + 'px';
    }
}

// 對外公開類別
window.LuopanEventHandler = LuopanEventHandler;