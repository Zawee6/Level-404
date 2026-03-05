// 1. 初始化 Lenis 平滑滾動
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 4)),
    direction: 'vertical',
    smooth: true
});

// 2. 註冊 GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// 3. Three.js 初始化
const container = document.getElementById('three-container');
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 4. 載入模型
const loader = new THREE.GLTFLoader();

// 🚨🚨🚨 請把下面這行的引號內，換成您放在資料夾裡的模型檔名！ 🚨🚨🚨
const MODEL_PATH = 'level404路牌.glb'; 

let model;
loader.load(MODEL_PATH, (gltf) => {
    model = gltf.scene;
    scene.add(model);
    console.log("模型載入成功！");
    setupScrollAnimation();
});

// 5. 設定滾動動畫
function setupScrollAnimation() {
    const conceptSection = document.querySelector('.concept-section');
    if (model && conceptSection) {
        gsap.to(model.rotation, {
            y: Math.PI * 4, // 滾動時轉兩圈
            scrollTrigger: {
                trigger: conceptSection,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    }
}

// 6. 渲染迴圈
function raf(time) {
    if (renderer && scene && camera) renderer.render(scene, camera);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);