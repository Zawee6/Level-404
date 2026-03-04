// 1. 初始化 Lenis 平滑滾動
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 4)),
    direction: 'vertical',
    smooth: true
});

// 2. 註冊 GSAP ScrollTrigger 並與 Lenis 綁定
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// 3. Three.js 初始化設定
const container = document.getElementById('three-container');
let scene, camera, renderer, model;

scene = new THREE.Scene();
scene.background = null; // 設定透明背景，才不會擋住後面的網頁

// 設定相機 (視角、長寬比、近裁切面、遠裁切面)
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // 相機距離模型的距離

// 設定渲染器
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 💡 打光 (非常重要！沒有光模型會是一片黑)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // 環境光
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // 平行光
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 確保視窗縮放時，3D 畫布也會跟著縮放
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 4. 載入 3D 模型
const loader = new THREE.GLTFLoader();

// 🚨🚨🚨 請將下面引號內的文字，換成您剛剛放進資料夾的模型檔案名稱！ 🚨🚨🚨
const MODEL_PATH = 'level404路牌.glb'; 

loader.load(MODEL_PATH, (gltf) => {
    model = gltf.scene;
    
    // 您可以在這裡調整模型的初始大小和位置
    model.scale.set(1, 1, 1); 
    model.position.set(0, 0, 0);
    
    scene.add(model);
    console.log('模型載入成功！');

    // 模型載入完成後，設定滾動動畫
    setupScrollAnimation();
}, undefined, (error) => {
    console.error('模型載入失敗：', error);
});

// 5. 設定 GSAP 滾動動畫
function setupScrollAnimation() {
    const conceptSection = document.querySelector('.concept-section');

    if (model && conceptSection) {
        // 動畫一：讓模型在滾動經過「專輯概念區塊」時，優雅地旋轉
        gsap.to(model.rotation, {
            y: Math.PI * 4, // Y軸旋轉兩圈 (720度)
            x: Math.PI / 4, // X軸稍微傾斜
            ease: "none",
            scrollTrigger: {
                trigger: conceptSection,
                start: "top bottom", // 區塊頂部碰到視窗底部時開始動畫
                end: "bottom top",   // 區塊底部離開視窗頂部時結束動畫
                scrub: 1 // 讓動畫平滑跟隨滑鼠滾動
            }
        });
        
        // 動畫二：讓模型稍微靠近相機 (放大效果)
        gsap.to(model.position, {
            z: 2.5, 
            ease: "none",
            scrollTrigger: {
                trigger: conceptSection,
                start: "top center",
                end: "bottom top",
                scrub: 1
            }
        });
    }
}

// 6. 渲染迴圈 (讓 Three.js 持續繪製畫面)
function raf(time) {
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);