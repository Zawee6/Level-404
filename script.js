/**
 * 核心目標：將 Lenis 的平滑滾動事件，導入給 GSAP 的 ScrollTrigger 使用。
 */

// 1. 初始化 Lenis 平滑滾動
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 4)),
    direction: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
});

// 2. 關鍵整合：將 Lenis 綁定到 ScrollTrigger
// 每次 Lenis 產生滾動事件時，都要通知 ScrollTrigger 更新位置
lenis.on('scroll', ScrollTrigger.update);

// 註冊 ScrollTrigger 插件 (確保 GSAP 知道這個插件存在)
gsap.registerPlugin(ScrollTrigger);

// 讓 ScrollTrigger 知道它必須使用 Lenis 提供的滾動事件，而不是原生的滾動
gsap.defaults({
    ease: "power2.inOut" // 設定一個預設的動畫緩動曲線
});

// Lenis 的滾動循環 (保持不變)
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// --- 範例：使用 ScrollTrigger 實現滾動動畫 ---

// 假設您的第二個區塊 (專輯概念區塊) 是 .concept-section
const conceptSection = document.querySelector('.concept-section');

if (conceptSection) {
    // 取得需要動畫的元素 (假設我們在概念區塊新增一個 h3)
    const title = conceptSection.querySelector('h2'); 
    
    // 創建 ScrollTrigger 實例
    gsap.to(title, {
        // 動畫目標屬性：從左邊移動 500px 到它原有的位置
        x: 0, 
        opacity: 1,
        
        // ScrollTrigger 配置
        scrollTrigger: {
            trigger: conceptSection, // 當這個區塊進入視窗時觸發動畫
            start: "top 80%",       // 當區塊頂部到達視窗 80% 高度時開始
            end: "top 20%",         // 當區塊頂部到達視窗 20% 高度時結束
            scrub: true,            // 將動畫與滾動條連結 (數值越大越平滑)
            
            // markers: true,        // (測試用) 顯示起始點和結束點標記，方便調試
        },
        
        // 初始狀態 (從哪裡開始動畫)
        x: -500, // 從左邊 -500px 處開始
        opacity: 0,
        duration: 1, // GSAP 的持續時間，但因為有 scrub，所以會被滾動進度覆蓋
    });
}