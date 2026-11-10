// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Real Three.js 3D Engine (Hero Showcase, GLTF/GLB Modal & STL Lab)
// ═══════════════════════════════════════════════════════════════════════════

export function toRawUrl(url) {
  if (!url) return '';
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }
  return url;
}

class Viewer3DManager {
  constructor() {
    this.heroScene = null;
    this.heroRenderer = null;
    this.heroCamera = null;
    this.heroMesh = null;

    this.modalScene = null;
    this.modalRenderer = null;
    this.modalCamera = null;
    this.modalAnim = null;
    this.modalModelGroup = null;
    this.wireframe = false;

    this.stlScene = null;
    this.stlRenderer = null;
    this.stlCamera = null;
    this.stlMesh = null;
  }

  /**
   * 1. Interactive 3D Hero Showcase on the Home Page
   */
  initHero3D() {
    const canvas = document.getElementById('hero3dCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const w = canvas.clientWidth || 460;
    const h = canvas.clientHeight || 310;

    this.heroScene = new THREE.Scene();
    this.heroCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.heroCamera.position.set(0, 0.8, 3.6);

    this.heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.heroRenderer.setSize(w, h, false);

    window.addEventListener('resize', () => {
      if (!canvas || !this.heroRenderer || !this.heroCamera) return;
      const nw = canvas.clientWidth || 300;
      const nh = canvas.clientHeight || 230;
      this.heroCamera.aspect = nw / nh;
      this.heroCamera.updateProjectionMatrix();
      this.heroRenderer.setSize(nw, nh, false);
    });

    const amb = new THREE.AmbientLight(0xffffff, 0.75);
    this.heroScene.add(amb);
    const dir1 = new THREE.DirectionalLight(0xff9e1b, 1.5);
    dir1.position.set(4, 6, 5);
    this.heroScene.add(dir1);
    const dir2 = new THREE.PointLight(0x4facfe, 0.7, 15);
    dir2.position.set(-4, -2, 3);
    this.heroScene.add(dir2);

    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff9e1b,
      roughness: 0.25,
      metalness: 0.35
    });

    // Build an intricate 3D TorusKnot + gyroscope rings representing 3D printing precision
    const knotGeo = new THREE.TorusKnotGeometry(0.75, 0.22, 128, 32);
    this.heroMesh = new THREE.Mesh(knotGeo, mat);
    group.add(this.heroMesh);

    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffc96b, roughness: 0.3, metalness: 0.5 });
    [1.35, 1.55].forEach((radius, idx) => {
      const rGeo = new THREE.TorusGeometry(radius, 0.03, 16, 64);
      const rMesh = new THREE.Mesh(rGeo, ringMat);
      rMesh.rotation.x = Math.PI / 2.4 + idx * 0.6;
      group.add(rMesh);
    });

    const grid = new THREE.GridHelper(5, 12, 0xff9e1b, 0x332414);
    grid.position.y = -1.35;
    this.heroScene.add(grid);
    this.heroScene.add(group);

    let isDragging = false;
    let prev = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', e => { isDragging = true; prev = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mousemove', e => {
      if (!isDragging) return;
      group.rotation.y += (e.clientX - prev.x) * 0.012;
      group.rotation.x += (e.clientY - prev.y) * 0.012;
      prev = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      isDragging = true;
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!isDragging || !e.touches.length) return;
      group.rotation.y += (e.touches[0].clientX - prev.x) * 0.012;
      group.rotation.x += (e.touches[0].clientY - prev.y) * 0.012;
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Try loading real GLB model p1.glb if GLTFLoader is available
    if (THREE.GLTFLoader) {
      const loader = new THREE.GLTFLoader();
      loader.load('assets/products/models/p1.glb', (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const scale = 2.0 / (size || 1);
        model.scale.setScalar(scale);
        group.clear();
        group.add(model);
        this.heroMesh = model;
      }, undefined, () => {});
    }

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isDragging) {
        group.rotation.y += 0.007;
      }
      this.heroRenderer.render(this.heroScene, this.heroCamera);
    };
    animate();
  }

  setHeroFilamentColor(hexStr) {
    if (!this.heroMesh || typeof THREE === 'undefined') return;
    const col = new THREE.Color(hexStr);
    this.heroMesh.traverse(child => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.color?.set(col));
        } else if (child.material.color) {
          child.material.color.set(col);
        }
      }
    });
  }

  /**
   * 2. Product Modal 3D Viewer (Supports real .glb/.gltf files + fallback procedural mesh)
   */
  initModal3D(modelUrl, tintHex = '#ff9e1b') {
    const canvas = document.getElementById('modal3dCanvas');
    const loading = document.getElementById('viewer3dLoading');
    if (!canvas || typeof THREE === 'undefined') return;

    this.destroyModal3D();
    if (loading) loading.style.display = 'flex';
    this.wireframe = false;

    const w = canvas.clientWidth || 640;
    const h = canvas.clientHeight || 380;

    this.modalScene = new THREE.Scene();
    this.modalScene.background = new THREE.Color(0xf7f1e6);
    this.modalCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    this.modalCamera.position.set(0, 1.1, 3.5);

    this.modalRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.modalRenderer.setSize(w, h, false);

    this.modalScene.add(new THREE.AmbientLight(0xffffff, 0.92));
    const dir = new THREE.DirectionalLight(0xffb84d, 1.35);
    dir.position.set(5, 8, 6);
    this.modalScene.add(dir);

    const grid = new THREE.GridHelper(6, 12, 0xffb84d, 0xe5d3b8);
    grid.position.y = -1.2;
    this.modalScene.add(grid);

    this.modalModelGroup = new THREE.Group();
    this.modalScene.add(this.modalModelGroup);

    const cleanUrl = toRawUrl(modelUrl);
    if (cleanUrl && THREE.GLTFLoader) {
      const loader = new THREE.GLTFLoader();
      loader.load(
        cleanUrl,
        (gltf) => {
          const obj = gltf.scene;
          const box = new THREE.Box3().setFromObject(obj);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());
          obj.position.sub(center);
          const scale = 2.1 / (size || 1);
          obj.scale.setScalar(scale);
          this.modalModelGroup.add(obj);
          if (loading) loading.style.display = 'none';
        },
        undefined,
        () => {
          this.addFallbackModalMesh(tintHex);
          if (loading) loading.style.display = 'none';
        }
      );
    } else {
      this.addFallbackModalMesh(tintHex);
      if (loading) loading.style.display = 'none';
    }

    let drag = false;
    let last = { x: 0, y: 0 };
    canvas.onmousedown = e => { drag = true; last = { x: e.clientX, y: e.clientY }; };
    canvas.onmouseup = () => { drag = false; };
    canvas.onmouseleave = () => { drag = false; };
    canvas.onmousemove = e => {
      if (!drag || !this.modalModelGroup) return;
      this.modalModelGroup.rotation.y += (e.clientX - last.x) * 0.012;
      this.modalModelGroup.rotation.x += (e.clientY - last.y) * 0.01;
      last = { x: e.clientX, y: e.clientY };
    };
    canvas.ontouchstart = e => {
      if (!e.touches.length) return;
      drag = true;
      last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    canvas.ontouchmove = e => {
      if (!drag || !this.modalModelGroup || !e.touches.length) return;
      this.modalModelGroup.rotation.y += (e.touches[0].clientX - last.x) * 0.012;
      this.modalModelGroup.rotation.x += (e.touches[0].clientY - last.y) * 0.01;
      last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    canvas.ontouchend = () => { drag = false; };
    canvas.onwheel = e => {
      if (!this.modalCamera) return;
      this.modalCamera.position.z = Math.max(1.4, Math.min(8, this.modalCamera.position.z + e.deltaY * 0.005));
    };

    const renderLoop = () => {
      this.modalAnim = requestAnimationFrame(renderLoop);
      if (!drag && this.modalModelGroup) {
        this.modalModelGroup.rotation.y += 0.006;
      }
      if (this.modalRenderer && this.modalScene && this.modalCamera) {
        this.modalRenderer.render(this.modalScene, this.modalCamera);
      }
    };
    renderLoop();
  }

  addFallbackModalMesh(tintHex = '#ff9e1b') {
    if (!this.modalModelGroup) return;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(tintHex),
      roughness: 0.3,
      metalness: 0.25
    });
    const geo = new THREE.IcosahedronGeometry(0.95, 2);
    const mesh = new THREE.Mesh(geo, mat);
    this.modalModelGroup.add(mesh);
  }

  toggleModalWireframe() {
    this.wireframe = !this.wireframe;
    if (this.modalModelGroup) {
      this.modalModelGroup.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.wireframe = this.wireframe;
        }
      });
    }
    return this.wireframe;
  }

  resetModalCamera() {
    if (this.modalCamera) this.modalCamera.position.set(0, 1.1, 3.5);
    if (this.modalModelGroup) this.modalModelGroup.rotation.set(0, 0, 0);
  }

  destroyModal3D() {
    if (this.modalAnim) cancelAnimationFrame(this.modalAnim);
    if (this.modalRenderer) {
      this.modalRenderer.dispose();
      this.modalRenderer = null;
    }
    this.modalScene = null;
    this.modalCamera = null;
    this.modalModelGroup = null;
  }

  /**
   * 3. Interactive STL Lab Parser & 3D Volume/Weight Estimator
   */
  initStlLab() {
    const canvas = document.getElementById('stlLabCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const w = canvas.clientWidth || 500;
    const h = canvas.clientHeight || 320;

    this.stlScene = new THREE.Scene();
    this.stlScene.background = new THREE.Color(0xf7f1e6);
    this.stlCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    this.stlCamera.position.set(0, 45, 110);
    this.stlCamera.lookAt(0, 0, 0);

    this.stlRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.stlRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.stlRenderer.setSize(w, h, false);

    window.addEventListener('resize', () => {
      if (!canvas || !this.stlRenderer || !this.stlCamera) return;
      const nw = canvas.clientWidth || 300;
      const nh = canvas.clientHeight || 240;
      this.stlCamera.aspect = nw / nh;
      this.stlCamera.updateProjectionMatrix();
      this.stlRenderer.setSize(nw, nh, false);
    });

    this.stlScene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dLight = new THREE.DirectionalLight(0xff9e1b, 1.35);
    dLight.position.set(60, 100, 80);
    this.stlScene.add(dLight);

    const grid = new THREE.GridHelper(160, 16, 0xff9e1b, 0xe5d3b8);
    grid.position.y = -25;
    this.stlScene.add(grid);

    // Load default demo geometry into STL Lab
    const demoGeo = new THREE.TorusKnotGeometry(22, 6.5, 100, 24);
    this.setStlGeometry(demoGeo);

    let drag = false;
    let prev = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', e => { drag = true; prev = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => { drag = false; });
    canvas.addEventListener('mousemove', e => {
      if (!drag || !this.stlMesh) return;
      this.stlMesh.rotation.y += (e.clientX - prev.x) * 0.012;
      this.stlMesh.rotation.x += (e.clientY - prev.y) * 0.012;
      prev = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      drag = true;
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!drag || !this.stlMesh || !e.touches.length) return;
      this.stlMesh.rotation.y += (e.touches[0].clientX - prev.x) * 0.012;
      this.stlMesh.rotation.x += (e.touches[0].clientY - prev.y) * 0.012;
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchend', () => { drag = false; });

    const loop = () => {
      requestAnimationFrame(loop);
      if (!drag && this.stlMesh) {
        this.stlMesh.rotation.y += 0.005;
      }
      this.stlRenderer.render(this.stlScene, this.stlCamera);
    };
    loop();
  }

  setStlGeometry(geometry, colorHex = '#ff9e1b') {
    if (!this.stlScene) return;
    if (this.stlMesh) {
      this.stlScene.remove(this.stlMesh);
    }
    geometry.computeVertexNormals();
    geometry.center();

    const box = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const normScale = 52 / maxDim;

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.32,
      metalness: 0.2
    });
    this.stlMesh = new THREE.Mesh(geometry, mat);
    this.stlMesh.scale.setScalar(normScale);
    this.stlScene.add(this.stlMesh);

    // Estimate volume in cm³ from bounding box * fill factor
    const volMm3 = size.x * size.y * size.z * 0.38;
    const volCm3 = Math.max(4, volMm3 / 1000);
    return {
      dimensionsMm: {
        x: Math.round(size.x || 45),
        y: Math.round(size.y || 45),
        z: Math.round(size.z || 45)
      },
      volumeCm3: parseFloat(volCm3.toFixed(1))
    };
  }

  /**
   * Parses Binary or ASCII .STL files directly in browser
   */
  parseStlBuffer(arrayBuffer) {
    const dv = new DataView(arrayBuffer);
    const isAscii = () => {
      const header = new Uint8Array(arrayBuffer, 0, Math.min(80, arrayBuffer.byteLength));
      const str = String.fromCharCode(...header);
      return str.trim().toLowerCase().startsWith('solid') && arrayBuffer.byteLength < 84 + dv.getUint32(80, true) * 50;
    };

    const positions = [];
    if (!isAscii() && arrayBuffer.byteLength >= 84) {
      const faces = dv.getUint32(80, true);
      let offset = 84;
      for (let i = 0; i < faces && offset + 50 <= arrayBuffer.byteLength; i++) {
        for (let v = 1; v <= 3; v++) {
          const vx = dv.getFloat32(offset + v * 12, true);
          const vy = dv.getFloat32(offset + v * 12 + 4, true);
          const vz = dv.getFloat32(offset + v * 12 + 8, true);
          positions.push(vx, vy, vz);
        }
        offset += 50;
      }
    } else {
      const text = new TextDecoder().decode(arrayBuffer);
      const regex = /vertex\s+([\d.+\-eE]+)\s+([\d.+\-eE]+)\s+([\d.+\-eE]+)/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        positions.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }
}

export const viewer3D = new Viewer3DManager();
