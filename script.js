// 💡 修正 1：註冊外掛
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 🌟 基礎變數與環境 🌟
// ==========================================
let headPivot; 
let targetMouse = { x: 0, y: 0 };
let currentMouse = { x: 0, y: 0 };
let isMouseActive = false;
let mouseTimeout;
let idleTime = 0;

window.addEventListener('mousemove', (event) => {
    const headXOffset = 0.8; 
    const headYOffset = 0.2; 
    targetMouse.x = (event.clientX / window.innerWidth - headXOffset) * 2;
    targetMouse.y = -(event.clientY / window.innerHeight - headYOffset) * 2;
    isMouseActive = true;
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => { isMouseActive = false; }, 1000);
});

const lenis = new Lenis();
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.5)); 
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

// ==========================================
// 🌟 核心容器宣告 🌟
// ==========================================
let mainAssemblyGroup = new THREE.Group(); 
scene.add(mainAssemblyGroup);

let signpostGroup = new THREE.Group(); 
mainAssemblyGroup.add(signpostGroup);

let extendingPolePivot = new THREE.Group(); 
extendingPolePivot.position.set(0, -2.5, -0.1); 
mainAssemblyGroup.add(extendingPolePivot);

let walkmanGroup = new THREE.Group(); 
mainAssemblyGroup.add(walkmanGroup);

let bgGroup = new THREE.Group(); 
bgGroup.position.z = -30; 
scene.add(bgGroup);

// ==========================================
// 🌟 建立要在 Three.js 裡長大的竿子 🌟
// ==========================================
const poleLength = 20;
const cylinderGeo = new THREE.CylinderGeometry(0.1, 0.1, poleLength, 16);
cylinderGeo.translate(0, -poleLength / 2, 0);

// 改成 StandardMaterial 讓竿子有一點光影立體感
const cylinderMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 });
const extendingPoleMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
extendingPoleMesh.scale.y = 0.001; 
extendingPolePivot.add(extendingPoleMesh);

// ==========================================
// 🌟 核心動畫控制 🌟
// ==========================================
gsap.to(bgGroup.position, {
    y: 150, 
    scrollTrigger: {
        trigger: ".concept-section", 
        start: "top bottom",         
        end: "top top",              
        scrub: 1,
    }
});

let connectingTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".concept-section",
        start: "top bottom", 
        end: "bottom center", 
        scrub: 1
    }
});

connectingTl.to(extendingPoleMesh.scale, { y: 1, duration: 3, ease: "power1.inOut" }, "synchronize");
connectingTl.to(walkmanGroup.position, { y: -2.5 - poleLength, duration: 3, ease: "power1.inOut" }, "synchronize");


// ==========================================
// 🌟 載入模型區域 🌟
// ==========================================
// 🚨 這裡就是剛剛我漏掉的致命一行！
const loader = new THREE.GLTFLoader(); 

// 1. 載入路牌
loader.load('level404_sign.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    signpostGroup.add(model);
    
    const initialScale = 5 / Math.max(size.x, size.y, size.z); 
    signpostGroup.scale.set(initialScale, initialScale, initialScale);
    
    gsap.to(signpostGroup.scale, {
        x: initialScale * 10, y: initialScale * 10, z: initialScale * 10,
        scrollTrigger: { trigger: ".concept-section", start: "top bottom", end: "top 40%", scrub: 1 }
    });

    gsap.to(mainAssemblyGroup.position, {
        y: 60, 
        scrollTrigger: { trigger: ".concept-section", start: "top 40%", end: "top top", scrub: 1 }
    });
});

// 2. 載入 Walkman
loader.load('walkmancopy.glb', (gltf) => {
    const walkmanModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(walkmanModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    walkmanModel.position.set(-center.x, -center.y, -center.z);
    
    // 🎯 這裡已經幫您放上微調的對位數字了！
    walkmanModel.position.x = -2.2; 
    walkmanModel.position.y = -1.5; 
    walkmanModel.position.z = 0; 
    
    walkmanModel.rotation.z = Math.PI; 
    walkmanGroup.add(walkmanModel); 

    const targetScale = 6 / Math.max(size.x, size.y, size.z); 
    walkmanGroup.scale.set(targetScale, targetScale, targetScale); 
    
    walkmanGroup.position.set(0, -2.5, -0.1);
});

// 3. 載入建築
loader.load('buildingcopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    bgGroup.add(m);
    const s = 80 / Math.max(b.getSize(new THREE.Vector3()).x, b.getSize(new THREE.Vector3()).y, b.getSize(new THREE.Vector3()).z);
    bgGroup.scale.set(s, s, s);
});

// 4. 載入地板
loader.load('grasscopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    m.position.y -= 10; m.position.z += 15;
    m.scale.set(25, 25, 25); 
    bgGroup.add(m);
});

// 5. 載入頭部
loader.load('headcopy.glb', (gltf) => {
    const m = gltf.scene;
    const b = new THREE.Box3().setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    headPivot = new THREE.Group();
    m.rotation.y = -Math.PI/2; 
    m.position.set(-c.x, -c.y, -c.z);
    headPivot.add(m);
    headPivot.position.set(40, 15, 0); 
    const s = 10 / Math.max(b.getSize(new THREE.Vector3()).x, b.getSize(new THREE.Vector3()).y, b.getSize(new THREE.Vector3()).z);
    headPivot.scale.set(s, s, s); 
    bgGroup.add(headPivot);
});

function animate() {
    requestAnimationFrame(animate);
    if (headPivot) {
        if (isMouseActive) {
            currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
            currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;
            headPivot.rotation.y = currentMouse.x * Math.PI * 0.25;  
            headPivot.rotation.x = -currentMouse.y * Math.PI * 0.15; 
        } else {
            idleTime += 0.01; 
            headPivot.rotation.y += (Math.sin(idleTime) * Math.PI * 0.15 - headPivot.rotation.y) * 0.02;
            headPivot.rotation.x += (Math.cos(idleTime * 0.7) * 0.1 - headPivot.rotation.x) * 0.02;
        }
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});