// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Real-Time Interactive 3D WebGL Spatial Engine (Three.js)
// Procedural Sculptural Japandi Vases, Christmas Trees, Gears Bracelets,
// Kinetic Fidgets, Ambient Spatial Stage, Hero Studio & Product 3D Inspector
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
    // 1. Ambient Full-Viewport Spatial Background Stage
    this.ambientScene = null;
    this.ambientRenderer = null;
    this.ambientCamera = null;
    this.ambientGroup = null;
    this.scrollProgress = 0;
    this.tiltX = 0;
    this.tiltY = 0;

    // 2. Hero Interactive 3D Sculptural Studio
    this.heroScene = null;
    this.heroRenderer = null;
    this.heroCamera = null;
    this.heroGroup = null;
    this.heroCurrentPreset = 'japandi';
    this.heroCurrentColor = '#b08d6e';
    this.heroAutoRotate = true;
    this.heroExploded = false;

    // 3. Gears Branch Interactive 3D Bracelet Stage
    this.gearsScene = null;
    this.gearsRenderer = null;
    this.gearsCamera = null;
    this.gearsGroup = null;
    this.gearsColor = '#c8a97e';

    // 4. Product Page Dedicated 3D Inspector
    this.modalScene = null;
    this.modalRenderer = null;
    this.modalCamera = null;
    this.modalAnim = null;
    this.modalModelGroup = null;
    this.wireframe = false;

    // 5. STL Lab Parser & 3D Volume/Weight Estimator
    this.stlScene = null;
    this.stlRenderer = null;
    this.stlCamera = null;
    this.stlMesh = null;
  }

  /**
   * Generates high-definition procedural 3D sculptural meshes matching Maker 3D collections:
   * - 'japandi': Ribbed organic Wabi-Sabi / Kanso vase + travertine base
   * - 'natal': Pleated spiral Christmas tree sculpture + star topper
   * - 'gears': Interlocking parametric bracelet links (Gears × Maker 3D)
   * - 'fidget': Multi-ring kinetic orbital gyroscope sculpture
   */
  createSculpturalPresetGroup(preset = 'japandi', hexColor = '#b08d6e') {
    const group = new THREE.Group();
    const mainColor = new THREE.Color(hexColor || '#b08d6e');
    const accentColor = new THREE.Color('#e4d7c5');
    const bronzeColor = new THREE.Color('#5a4332');

    const primaryMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.34,
      metalness: 0.18,
      flatShading: false
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.65,
      metalness: 0.05
    });
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: bronzeColor,
      roughness: 0.28,
      metalness: 0.55
    });

    if (preset === 'natal') {
      // Sculptural Pleated Christmas Tree (Pinheiro Plissado)
      const tiers = 5;
      for (let t = 0; t < tiers; t++) {
        const progress = t / tiers;
        const radiusBottom = 1.05 * (1 - progress * 0.72);
        const radiusTop = 0.25 * (1 - progress * 0.8);
        const height = 0.52;
        const radialSegs = 28;
        const coneGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegs, 1, false);
        const pos = coneGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vz = pos.getZ(i);
          const vy = pos.getY(i);
          if (vy < height * 0.45) {
            const angle = Math.atan2(vz, vx);
            const pleat = 1 + 0.14 * Math.cos(angle * 14);
            pos.setX(i, vx * pleat);
            pos.setZ(i, vz * pleat);
          }
        }
        coneGeo.computeVertexNormals();
        const tierMesh = new THREE.Mesh(coneGeo, primaryMat);
        tierMesh.position.y = -0.55 + t * 0.34;
        tierMesh.userData.baseY = tierMesh.position.y;
        tierMesh.userData.explodeOffset = new THREE.Vector3(0, (t - 2) * 0.22, 0);
        group.add(tierMesh);
      }
      // Minimalist Star Topper
      const starGeo = new THREE.OctahedronGeometry(0.2, 0);
      const starMesh = new THREE.Mesh(starGeo, bronzeMat);
      starMesh.position.y = 1.12;
      starMesh.userData.baseY = 1.12;
      starMesh.userData.explodeOffset = new THREE.Vector3(0, 0.35, 0);
      group.add(starMesh);

      // Pedestal
      const baseGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.28, 32);
      const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
      baseMesh.position.y = -0.92;
      baseMesh.userData.baseY = -0.92;
      baseMesh.userData.explodeOffset = new THREE.Vector3(0, -0.25, 0);
      group.add(baseMesh);

    } else if (preset === 'gears') {
      // Gears × Maker 3D — Parametric Interlocking Sculptural Bracelet
      const numLinks = 16;
      const ringRadius = 1.05;
      for (let i = 0; i < numLinks; i++) {
        const angle = (i / numLinks) * Math.PI * 2;
        const linkGeo = new THREE.TorusGeometry(0.24, 0.075, 18, 36);
        const linkMat = i % 2 === 0 ? primaryMat : bronzeMat;
        const link = new THREE.Mesh(linkGeo, linkMat);
        link.position.set(Math.cos(angle) * ringRadius, Math.sin(angle * 2) * 0.08, Math.sin(angle) * ringRadius);
        link.rotation.y = -angle + Math.PI / 2;
        link.rotation.x = (i % 2 === 0 ? 0.55 : -0.55);
        link.userData.basePos = link.position.clone();
        link.userData.explodeOffset = link.position.clone().normalize().multiplyScalar(0.32);
        group.add(link);
      }
      // Inner Kinetic Wave Cuff
      const waveGeo = new THREE.TorusKnotGeometry(0.62, 0.045, 96, 16, 2, 3);
      const waveMesh = new THREE.Mesh(waveGeo, stoneMat);
      waveMesh.rotation.x = Math.PI / 2;
      group.add(waveMesh);

    } else if (preset === 'fidget') {
      // Kinetic Pass-Through & Orbital Gyroscope Fidget Sculpture
      const coreGeo = new THREE.IcosahedronGeometry(0.38, 2);
      const coreMesh = new THREE.Mesh(coreGeo, bronzeMat);
      group.add(coreMesh);

      const radii = [0.62, 0.84, 1.06, 1.26];
      radii.forEach((r, idx) => {
        const ringGeo = new THREE.TorusGeometry(r, 0.055, 20, 64);
        const rMesh = new THREE.Mesh(ringGeo, idx % 2 === 0 ? primaryMat : stoneMat);
        rMesh.rotation.x = (idx * Math.PI) / 4;
        rMesh.rotation.y = (idx * Math.PI) / 6;
        rMesh.userData.isKineticRing = true;
        rMesh.userData.ringSpeed = (idx % 2 === 0 ? 1 : -1) * (0.012 + idx * 0.004);
        rMesh.userData.explodeOffset = new THREE.Vector3(0, (idx - 1.5) * 0.25, 0);
        group.add(rMesh);
      });

    } else {
      // Default 'japandi': Sculptural Ribbed Vase Kanso + Wabi-Sabi Companion + Zen Tray
      const buildRibbedVase = (scaleFactor, ribsCount, matToUse) => {
        const vaseGeo = new THREE.CylinderGeometry(0.42 * scaleFactor, 0.56 * scaleFactor, 1.85 * scaleFactor, 72, 42, false);
        const pos = vaseGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const vz = pos.getZ(i);
          const normY = (vy / (1.85 * scaleFactor)) + 0.5; // 0 at bottom, 1 at top
          const angle = Math.atan2(vz, vx);
          const baseRadius = Math.sqrt(vx * vx + vz * vz);
          // Organic belly curve (fuller lower-mid body, narrower neck)
          const belly = Math.sin(normY * Math.PI) * 0.36 * scaleFactor * (1 - normY * 0.35);
          // Vertical architectural ribs on upper portion (like the uploaded Japandi poster!)
          const ribMask = normY > 0.32 ? Math.min(1, (normY - 0.32) * 3.2) : 0;
          const ribOffset = Math.cos(angle * ribsCount) * 0.032 * scaleFactor * ribMask;
          const finalR = Math.max(0.12, baseRadius + belly + ribOffset);
          pos.setX(i, Math.cos(angle) * finalR);
          pos.setZ(i, Math.sin(angle) * finalR);
        }
        vaseGeo.computeVertexNormals();
        return new THREE.Mesh(vaseGeo, matToUse);
      };

      const mainVase = buildRibbedVase(1.0, 36, primaryMat);
      mainVase.position.set(0.28, -0.05, 0.18);
      mainVase.userData.basePos = mainVase.position.clone();
      mainVase.userData.explodeOffset = new THREE.Vector3(0.28, 0.18, 0.2);
      group.add(mainVase);

      const secondVase = buildRibbedVase(0.84, 30, stoneMat);
      secondVase.position.set(-0.48, -0.2, -0.22);
      secondVase.userData.basePos = secondVase.position.clone();
      secondVase.userData.explodeOffset = new THREE.Vector3(-0.32, 0.12, -0.22);
      group.add(secondVase);

      // Zen Catch-All Tray Base
      const trayGeo = new THREE.CylinderGeometry(1.28, 1.35, 0.12, 48);
      const trayMesh = new THREE.Mesh(trayGeo, bronzeMat);
      trayMesh.position.y = -1.02;
      trayMesh.userData.basePos = trayMesh.position.clone();
      trayMesh.userData.explodeOffset = new THREE.Vector3(0, -0.28, 0);
      group.add(trayMesh);
    }

    return group;
  }

  /**
   * 1. Ambient Full-Viewport 3D Spatial Background Canvas (#spatialBgCanvas)
   * Reacts to scroll depth and phone tilt / mouse position
   */
  initAmbientSpatialStage() {
    const canvas = document.getElementById('spatialBgCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    this.ambientScene = new THREE.Scene();
    this.ambientCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.ambientCamera.position.set(0, 0, 9);

    this.ambientRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.ambientRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.ambientRenderer.setSize(window.innerWidth, window.innerHeight, false);

    const ambLight = new THREE.AmbientLight(0xfffcf7, 0.9);
    this.ambientScene.add(ambLight);
    const dirLight = new THREE.DirectionalLight(0xc8a97e, 1.1);
    dirLight.position.set(6, 10, 8);
    this.ambientScene.add(dirLight);

    this.ambientGroup = new THREE.Group();
    this.ambientScene.add(this.ambientGroup);

    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd8c7b4,
      roughness: 0.45,
      metalness: 0.2,
      transparent: true,
      opacity: 0.28
    });
    const pebbleMat = new THREE.MeshStandardMaterial({
      color: 0xb08d6e,
      roughness: 0.5,
      metalness: 0.15,
      transparent: true,
      opacity: 0.22
    });

    const shapes = [
      { geo: new THREE.TorusGeometry(1.6, 0.025, 16, 64), pos: [-4.2, 2.2, -3], rot: [0.6, 0.4, 0], mat: ringMat },
      { geo: new THREE.TorusGeometry(2.1, 0.02, 16, 64), pos: [4.5, -1.8, -4], rot: [-0.5, 0.8, 0.2], mat: ringMat },
      { geo: new THREE.OctahedronGeometry(0.55, 0), pos: [-3.6, -2.6, -2], rot: [0.2, 0.5, 0.1], mat: pebbleMat },
      { geo: new THREE.IcosahedronGeometry(0.48, 1), pos: [3.8, 2.6, -2.5], rot: [0.4, -0.3, 0.2], mat: pebbleMat },
      { geo: new THREE.TorusKnotGeometry(0.5, 0.08, 64, 12), pos: [0.2, -3.4, -4.5], rot: [0.3, 0.7, 0], mat: ringMat }
    ];

    shapes.forEach((s, idx) => {
      const m = new THREE.Mesh(s.geo, s.mat);
      m.position.set(...s.pos);
      m.rotation.set(...s.rot);
      m.userData = { baseY: s.pos[1], speed: 0.002 + idx * 0.0008, phase: idx * 1.3 };
      this.ambientGroup.add(m);
    });

    window.addEventListener('resize', () => {
      if (!this.ambientRenderer || !this.ambientCamera) return;
      this.ambientCamera.aspect = window.innerWidth / window.innerHeight;
      this.ambientCamera.updateProjectionMatrix();
      this.ambientRenderer.setSize(window.innerWidth, window.innerHeight, false);
    });

    window.addEventListener('scroll', () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      this.scrollProgress = window.scrollY / maxScroll;
    }, { passive: true });

    let t = 0;
    const animateAmbient = () => {
      requestAnimationFrame(animateAmbient);
      t += 0.012;
      if (this.ambientGroup) {
        this.ambientGroup.rotation.y = this.scrollProgress * Math.PI * 0.65 + this.tiltX * 0.18;
        this.ambientGroup.rotation.x = this.tiltY * 0.14;
        this.ambientGroup.children.forEach(child => {
          child.rotation.y += child.userData.speed;
          child.rotation.x += child.userData.speed * 0.6;
          child.position.y = child.userData.baseY + Math.sin(t + child.userData.phase) * 0.22;
        });
      }
      this.ambientRenderer.render(this.ambientScene, this.ambientCamera);
    };
    animateAmbient();
  }

  setDeviceTiltNormalized(nx, ny) {
    this.tiltX = nx;
    this.tiltY = ny;
  }

  /**
   * 2. Interactive 3D Hero Sculptural Studio on the Home Page (#hero3dCanvas)
   */
  initHero3D() {
    const canvas = document.getElementById('hero3dCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const w = canvas.clientWidth || 440;
    const h = canvas.clientHeight || 400;

    this.heroScene = new THREE.Scene();
    this.heroCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.heroCamera.position.set(0, 0.55, 4.1);
    this.heroCamera.lookAt(0, -0.05, 0);

    this.heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.heroRenderer.setSize(w, h, false);

    window.addEventListener('resize', () => {
      if (!canvas || !this.heroRenderer || !this.heroCamera) return;
      const nw = canvas.clientWidth || 320;
      const nh = canvas.clientHeight || 320;
      this.heroCamera.aspect = nw / nh;
      this.heroCamera.updateProjectionMatrix();
      this.heroRenderer.setSize(nw, nh, false);
    });

    // Warm Luxury Studio Lighting
    this.heroScene.add(new THREE.AmbientLight(0xfffaf2, 0.92));
    const keyLight = new THREE.DirectionalLight(0xffe6c8, 1.45);
    keyLight.position.set(4, 7, 5);
    this.heroScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xb08d6e, 0.85);
    rimLight.position.set(-5, 3, -4);
    this.heroScene.add(rimLight);

    const fillLight = new THREE.PointLight(0xf4f0e7, 0.65, 15);
    fillLight.position.set(0, -3, 4);
    this.heroScene.add(fillLight);

    // Subtle Architectural Turntable Platform
    const ringGeo = new THREE.RingGeometry(1.38, 1.42, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc8b49e, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
    const turntableRing = new THREE.Mesh(ringGeo, ringMat);
    turntableRing.rotation.x = Math.PI / 2;
    turntableRing.position.y = -1.08;
    this.heroScene.add(turntableRing);

    this.heroGroup = new THREE.Group();
    this.heroScene.add(this.heroGroup);
    this.setHeroPreset('japandi', '#b08d6e');

    // Orbit Drag + Touch + Pinch/Wheel Zoom Controls
    let isDragging = false;
    let prev = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      prev = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mousemove', e => {
      if (!isDragging || !this.heroGroup) return;
      this.heroGroup.rotation.y += (e.clientX - prev.x) * 0.012;
      this.heroGroup.rotation.x = Math.max(-0.6, Math.min(0.6, this.heroGroup.rotation.x + (e.clientY - prev.y) * 0.01));
      prev = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      isDragging = true;
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!isDragging || !e.touches.length || !this.heroGroup) return;
      this.heroGroup.rotation.y += (e.touches[0].clientX - prev.x) * 0.013;
      this.heroGroup.rotation.x = Math.max(-0.6, Math.min(0.6, this.heroGroup.rotation.x + (e.touches[0].clientY - prev.y) * 0.01));
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchend', () => { isDragging = false; });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (!this.heroCamera) return;
      this.heroCamera.position.z = Math.max(2.4, Math.min(6.2, this.heroCamera.position.z + e.deltaY * 0.003));
    }, { passive: false });

    const animate = () => {
      requestAnimationFrame(animate);
      if (this.heroGroup) {
        if (!isDragging && this.heroAutoRotate) {
          this.heroGroup.rotation.y += 0.0065;
        }
        // Animate kinetic rings if Fidget preset is active
        this.heroGroup.traverse(obj => {
          if (obj.userData && obj.userData.isKineticRing) {
            obj.rotation.x += obj.userData.ringSpeed;
            obj.rotation.z += obj.userData.ringSpeed * 0.7;
          }
        });
      }
      if (this.heroRenderer && this.heroScene && this.heroCamera) {
        this.heroRenderer.render(this.heroScene, this.heroCamera);
      }
    };
    animate();

    // Also initialize Gears 3D Canvas if present
    this.initGearsBranch3D();
  }

  setHeroPreset(presetName, colorHex) {
    this.heroCurrentPreset = presetName || this.heroCurrentPreset || 'japandi';
    if (colorHex) this.heroCurrentColor = colorHex;
    if (!this.heroGroup || typeof THREE === 'undefined') return;

    while (this.heroGroup.children.length > 0) {
      this.heroGroup.remove(this.heroGroup.children[0]);
    }
    const meshGroup = this.createSculpturalPresetGroup(this.heroCurrentPreset, this.heroCurrentColor);
    this.heroGroup.add(meshGroup);
    this.heroGroup.rotation.set(0.08, 0.35, 0);
    this.heroExploded = false;
  }

  setHeroFilamentColor(hexStr) {
    this.heroCurrentColor = hexStr;
    this.setHeroPreset(this.heroCurrentPreset, hexStr);
  }

  toggleHeroExplodeView() {
    if (!this.heroGroup) return false;
    this.heroExploded = !this.heroExploded;
    this.heroGroup.traverse(obj => {
      if (obj.userData && obj.userData.explodeOffset) {
        if (this.heroExploded) {
          obj.position.add(obj.userData.explodeOffset);
        } else {
          obj.position.sub(obj.userData.explodeOffset);
        }
      }
    });
    return this.heroExploded;
  }

  toggleHeroWireframe() {
    if (!this.heroGroup) return false;
    this.heroWireframe = !this.heroWireframe;
    this.heroGroup.traverse(c => {
      if (c.isMesh && c.material) {
        c.material.wireframe = this.heroWireframe;
      }
    });
    return this.heroWireframe;
  }

  /**
   * 3. Gears × Maker 3D Branch Dedicated 3D Bracelet Customizer (#gears3dCanvas)
   */
  initGearsBranch3D() {
    const canvas = document.getElementById('gears3dCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const w = canvas.clientWidth || 420;
    const h = canvas.clientHeight || 320;

    this.gearsScene = new THREE.Scene();
    this.gearsCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.gearsCamera.position.set(0, 1.35, 3.3);
    this.gearsCamera.lookAt(0, 0, 0);

    this.gearsRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.gearsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.gearsRenderer.setSize(w, h, false);

    this.gearsScene.add(new THREE.AmbientLight(0xfffaf2, 0.95));
    const dLight = new THREE.DirectionalLight(0xffe2bd, 1.4);
    dLight.position.set(4, 6, 5);
    this.gearsScene.add(dLight);

    this.gearsGroup = new THREE.Group();
    this.gearsScene.add(this.gearsGroup);
    this.setGearsBraceletColor(this.gearsColor);

    let drag = false;
    let prev = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', e => { drag = true; prev = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => { drag = false; });
    canvas.addEventListener('mousemove', e => {
      if (!drag || !this.gearsGroup) return;
      this.gearsGroup.rotation.y += (e.clientX - prev.x) * 0.012;
      this.gearsGroup.rotation.x += (e.clientY - prev.y) * 0.012;
      prev = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      drag = true;
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!drag || !e.touches.length || !this.gearsGroup) return;
      this.gearsGroup.rotation.y += (e.touches[0].clientX - prev.x) * 0.012;
      this.gearsGroup.rotation.x += (e.touches[0].clientY - prev.y) * 0.012;
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchend', () => { drag = false; });

    const loop = () => {
      requestAnimationFrame(loop);
      if (this.gearsGroup && !drag) {
        this.gearsGroup.rotation.y += 0.007;
      }
      if (this.gearsRenderer && this.gearsScene && this.gearsCamera) {
        this.gearsRenderer.render(this.gearsScene, this.gearsCamera);
      }
    };
    loop();
  }

  setGearsBraceletColor(hexStr = '#c8a97e') {
    this.gearsColor = hexStr;
    if (!this.gearsGroup || typeof THREE === 'undefined') return;
    while (this.gearsGroup.children.length > 0) {
      this.gearsGroup.remove(this.gearsGroup.children[0]);
    }
    this.gearsGroup.add(this.createSculpturalPresetGroup('gears', hexStr));
  }

  /**
   * 4. Product Page Dedicated 3D Viewer (#modal3dCanvas)
   * Supports real .glb/.gltf files OR procedural collection-accurate 3D meshes
   */
  initModal3D(modelUrl, tintHex = '#b08d6e', categoryHint = '') {
    const canvas = document.getElementById('modal3dCanvas');
    const loading = document.getElementById('viewer3dLoading');
    if (!canvas || typeof THREE === 'undefined') return;

    this.destroyModal3D();
    if (loading) loading.style.display = 'flex';
    this.wireframe = false;

    const w = canvas.clientWidth || 640;
    const h = canvas.clientHeight || 380;

    this.modalScene = new THREE.Scene();
    this.modalScene.background = new THREE.Color(0xf4f0e7);
    this.modalCamera = new THREE.PerspectiveCamera(46, w / h, 0.1, 200);
    this.modalCamera.position.set(0, 0.9, 3.8);

    this.modalRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.modalRenderer.setSize(w, h, false);

    this.modalScene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const dir = new THREE.DirectionalLight(0xc8a97e, 1.4);
    dir.position.set(5, 8, 6);
    this.modalScene.add(dir);

    const grid = new THREE.GridHelper(6, 12, 0xb08d6e, 0xe4dcd0);
    grid.position.y = -1.15;
    this.modalScene.add(grid);

    this.modalModelGroup = new THREE.Group();
    this.modalScene.add(this.modalModelGroup);

    const catLower = (categoryHint || '').toLowerCase();
    const fallbackPreset =
      catLower.includes('natal') ? 'natal' :
      catLower.includes('gears') ? 'gears' :
      catLower.includes('fidget') ? 'fidget' : 'japandi';

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
          this.addFallbackModalMesh(tintHex, fallbackPreset);
          if (loading) loading.style.display = 'none';
        }
      );
    } else {
      this.addFallbackModalMesh(tintHex, fallbackPreset);
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
      this.modalCamera.position.z = Math.max(1.6, Math.min(7.5, this.modalCamera.position.z + e.deltaY * 0.004));
    };

    const renderLoop = () => {
      this.modalAnim = requestAnimationFrame(renderLoop);
      if (!drag && this.modalModelGroup) {
        this.modalModelGroup.rotation.y += 0.0065;
      }
      if (this.modalRenderer && this.modalScene && this.modalCamera) {
        this.modalRenderer.render(this.modalScene, this.modalCamera);
      }
    };
    renderLoop();
  }

  addFallbackModalMesh(tintHex = '#b08d6e', preset = 'japandi') {
    if (!this.modalModelGroup) return;
    const sculpturalGroup = this.createSculpturalPresetGroup(preset, tintHex);
    this.modalModelGroup.add(sculpturalGroup);
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
    if (this.modalCamera) this.modalCamera.position.set(0, 0.9, 3.8);
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
   * 5. Interactive STL Lab Parser & 3D Volume/Weight Estimator (#stlLabCanvas)
   */
  initStlLab() {
    const canvas = document.getElementById('stlLabCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const w = canvas.clientWidth || 500;
    const h = canvas.clientHeight || 320;

    this.stlScene = new THREE.Scene();
    this.stlScene.background = new THREE.Color(0xf4f0e7);
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

    this.stlScene.add(new THREE.AmbientLight(0xffffff, 0.92));
    const dLight = new THREE.DirectionalLight(0xb08d6e, 1.35);
    dLight.position.set(60, 100, 80);
    this.stlScene.add(dLight);

    const grid = new THREE.GridHelper(160, 16, 0xb08d6e, 0xe4dcd0);
    grid.position.y = -25;
    this.stlScene.add(grid);

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

  setStlGeometry(geometry, colorHex = '#b08d6e') {
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
