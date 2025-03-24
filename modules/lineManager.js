// 線條設定介面
class LineConfig {
    constructor(color = 'red', thickness = 2, zIndex = 10001) {
        this.color = color;
        this.thickness = thickness;
        this.zIndex = zIndex;
    }
}

// 線條管理器類別
class LineManager {
    constructor() {
        this.lines = [];
        this.currentLine = null;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.config = new LineConfig();
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

    // 開始繪製線條
    startDrawing(container, e) {
        this.isDrawing = true;
        const rect = container.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        this.currentLine = this.createLine();
        const linesContainer = container.querySelector('#luopanLinesContainer');
        if (linesContainer) {
            linesContainer.appendChild(this.currentLine);
            this.debug(`開始畫線: (${this.startX}, ${this.startY})`);
        }
    }

    // 建立新線條
    createLine() {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.backgroundColor = this.config.color;
        line.style.height = `${this.config.thickness}px`;
        line.style.transformOrigin = '0 0';
        line.style.zIndex = this.config.zIndex;
        line.style.left = this.startX + 'px';
        line.style.top = this.startY + 'px';
        
        return line;
    }

    // 更新線條繪製
    updateDrawing(e, container) {
        if (!this.isDrawing || !this.currentLine) return;

        const rect = container.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const dx = currentX - this.startX;
        const dy = currentY - this.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        this.currentLine.style.width = length + 'px';
        this.currentLine.style.transform = `rotate(${angle}deg)`;
    }

    // 結束線條繪製
    finishDrawing() {
        if (this.currentLine) {
            this.lines.push(this.currentLine);
            this.debug('線條繪製完成');
        }
        this.isDrawing = false;
        this.currentLine = null;
    }

    // 清除所有線條
    clearAllLines(container) {
        const linesContainer = container.querySelector('#luopanLinesContainer');
        if (linesContainer) {
            while (this.lines.length > 0) {
                const line = this.lines.pop();
                if (line && line.parentNode) {
                    line.parentNode.removeChild(line);
                }
            }
            this.debug('所有線條已清除');
        }
    }

    // 設定線條顏色
    setLineColor(color) {
        this.config.color = color;
    }

    // 設定線條粗細
    setLineThickness(thickness) {
        this.config.thickness = thickness;
    }

    // 取得目前線條數量
    getLineCount() {
        return this.lines.length;
    }
}

// 對外公開類別和介面
window.LuopanLineManager = new LineManager();
window.LuopanLineConfig = LineConfig;