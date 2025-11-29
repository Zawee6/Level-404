/**
 * 1. 初始化 Lenis 平滑滾動
 * 2. 監聽滾動事件，將滾動百分比對應到視覺變化
 */

// 1. 初始化 Lenis
const lenis = new Lenis({
    duration: 1.2,    // 滾動時間，數值越大越慢越平滑
    easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 4)), // 自定義緩動函數
    direction: 'vertical', // 垂直滾動
    smooth: true,
    smoothTouch: false, // 關閉觸摸設備上的平滑滾動，以保持原生體驗
    touchMultiplier: 2,
});

// Lenis 必須在瀏覽器的 requestAnimationFrame 循環中運行
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// --- 核心滾動邏輯 ---

const visualElement = document.getElementById('album-visual');
const conceptSection = document.querySelector('.concept-section');

// 2. 監聽 Lenis 的滾動事件
lenis.on('scroll', () => {
    // 取得概念區塊相對於視窗頂部的資訊
    const conceptRect = conceptSection.getBoundingClientRect();
    
    // 計算概念區塊的滾動進度 (0 到 1)
    
    // startOffset: 當概念區塊的底部進入視窗時開始計算
    const startOffset = window.innerHeight; 
    
    // 總滾動距離：概念區塊的高度
    const totalScroll = conceptSection.offsetHeight; 
    
    // 計算滾動進度：從區塊底部剛進入視窗 (conceptRect.bottom = startOffset) 開始
    let conceptProgress = (startOffset - conceptRect.top) / totalScroll;
    
    // 將進度鎖定在 0 到 1 之間
    conceptProgress = Math.max(0, Math.min(1, conceptProgress)); 

    // --- 實作視覺變化：圖片縮放和旋轉 ---

    // 1. 圖片縮放：從 100% 縮小到 80%
    // 當 progress 為 0 時 scale=1.0；當 progress 為 1 時 scale=0.8
    const scaleValue = 1 - (conceptProgress * 0.2); 
    
    // 2. 圖片旋轉：從 0 度旋轉到 360 度
    const rotateValue = conceptProgress * 360; 

    // 3. 圖片透明度：從 100% 變為 60%
    const opacityValue = 1 - (conceptProgress * 0.4); 

    // 應用樣式變化
    visualElement.style.transform = `scale(${scaleValue}) rotate(${rotateValue}deg)`;
    visualElement.style.opacity = opacityValue;
});
