chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: addOverlay
  });
});

function addOverlay() {
  // 這邊可以放一些初始化程式碼，如果需要在點擊擴充功能圖示時執行
  console.log("擴充功能已啟動");
}
