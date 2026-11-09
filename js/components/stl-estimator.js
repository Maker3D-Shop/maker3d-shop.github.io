// ═══════════════════════════════════════════════════════════════════════════
// Maker3D — Interactive 3D STL Custom Quote Laboratory
// ═══════════════════════════════════════════════════════════════════════════
import { viewer3D } from './viewer3d.js';
import { store } from '../config/store.js';
import { dbService } from '../services/db.js';
import { showToast } from './ui.js';

let stlQuoteState = {
  fileName: 'Modelo_Padrao_Demo.stl',
  volumeCm3: 28.5,
  dimensions: { x: 55, y: 55, z: 48 },
  material: 'PLA',
  infill: 20,
  layerHeight: '0.16',
  scalePct: 100,
  colorHex: '#ff9e1b',
  colorName: 'Laranja Maker3D'
};

const MATERIAL_RATES = {
  PLA:  { density: 1.24, pricePerGram: 0.42, label: 'PLA Premium (Decorativo & Detalhado)' },
  PETG: { density: 1.27, pricePerGram: 0.52, label: 'PETG Resistente (Mecânico & Externo)' },
  TPU:  { density: 1.21, pricePerGram: 0.68, label: 'TPU Flexível (Borracha Elástica)' }
};

export function initStlEstimator() {
  const dropZone = document.getElementById('stlDropZone');
  const fileInput = document.getElementById('stlFileInput');
  if (dropZone && fileInput) {
    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleStlFile(e.target.files[0]);
    });
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'var(--brand-primary)'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleStlFile(e.dataTransfer.files[0]);
    });
  }
  recalculateStlQuote();
}

function handleStlFile(file) {
  stlQuoteState.fileName = file.name;
  const nameBadge = document.getElementById('stlLoadedFileName');
  if (nameBadge) nameBadge.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const geo = viewer3D.parseStlBuffer(ev.target.result);
      const metrics = viewer3D.setStlGeometry(geo, stlQuoteState.colorHex);
      if (metrics) {
        stlQuoteState.volumeCm3 = metrics.volumeCm3;
        stlQuoteState.dimensions = metrics.dimensionsMm;
      }
      recalculateStlQuote();
      showToast(`✅ Arquivo 3D "${file.name}" analisado com sucesso!`, 'success');
    } catch (err) {
      console.warn('STL parse fallback:', err);
      stlQuoteState.volumeCm3 = Math.max(12, Math.round(file.size / 8500));
      recalculateStlQuote();
      showToast(`📐 Estimativa gerada para "${file.name}"`, 'success');
    }
  };
  reader.readAsArrayBuffer(file);
}

export function setStlMaterial(mat, btnEl) {
  stlQuoteState.material = mat;
  document.querySelectorAll('.mat-option-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  recalculateStlQuote();
}

export function updateStlParams() {
  const scaleEl = document.getElementById('stlScaleRange');
  const infillEl = document.getElementById('stlInfillRange');
  const layerEl = document.getElementById('stlLayerSelect');

  if (scaleEl) {
    stlQuoteState.scalePct = parseInt(scaleEl.value, 10) || 100;
    document.getElementById('stlScaleVal').textContent = stlQuoteState.scalePct + '%';
  }
  if (infillEl) {
    stlQuoteState.infill = parseInt(infillEl.value, 10) || 20;
    document.getElementById('stlInfillVal').textContent = stlQuoteState.infill + '%';
  }
  if (layerEl) {
    stlQuoteState.layerHeight = layerEl.value;
  }
  recalculateStlQuote();
}

export function recalculateStlQuote() {
  const matInfo = MATERIAL_RATES[stlQuoteState.material] || MATERIAL_RATES.PLA;
  const scaleFactor = Math.pow(stlQuoteState.scalePct / 100, 3);
  const infillFactor = 0.35 + (stlQuoteState.infill / 100) * 0.65;
  const layerFactor = stlQuoteState.layerHeight === '0.12' ? 1.25 : (stlQuoteState.layerHeight === '0.24' ? 0.85 : 1.0);

  const effectiveVol = stlQuoteState.volumeCm3 * scaleFactor * infillFactor;
  const grams = Math.max(5, Math.round(effectiveVol * matInfo.density));
  const hours = Math.max(0.8, parseFloat(((grams / 14) * layerFactor).toFixed(1)));
  const estimatedPrice = Math.max(18, Math.round((grams * matInfo.pricePerGram + hours * 4.5) * 1.1));

  const gEl = document.getElementById('stlEstGrams');
  const hEl = document.getElementById('stlEstHours');
  const dEl = document.getElementById('stlEstDims');
  const pEl = document.getElementById('stlEstPrice');

  const s = stlQuoteState.scalePct / 100;
  if (gEl) gEl.textContent = `${grams}g`;
  if (hEl) hEl.textContent = `~${hours}h`;
  if (dEl) dEl.textContent = `${Math.round(stlQuoteState.dimensions.x * s)}×${Math.round(stlQuoteState.dimensions.y * s)}×${Math.round(stlQuoteState.dimensions.z * s)} mm`;
  if (pEl) pEl.textContent = `R$ ${estimatedPrice.toFixed(2).replace('.', ',')}`;

  stlQuoteState.estimatedGrams = grams;
  stlQuoteState.estimatedHours = hours;
  stlQuoteState.estimatedPrice = estimatedPrice;
}

export async function sendStlQuoteToWhatsApp() {
  const desc = document.getElementById('stlCustomNotes')?.value.trim() || '';
  const order = await dbService.createOrder({
    type: 'custom_stl',
    items: [{
      id: 'custom-stl',
      name: `Impressão Sob Medida (${stlQuoteState.fileName})`,
      qty: 1,
      price: stlQuoteState.estimatedPrice,
      selectedColors: [{ name: stlQuoteState.material, hex: '#ff9e1b' }]
    }],
    total: stlQuoteState.estimatedPrice,
    notes: `Material: ${stlQuoteState.material} | Preenchimento: ${stlQuoteState.infill}% | Escala: ${stlQuoteState.scalePct}% | ${desc}`
  });

  const phone = store.state.settings.whatsappNumber || '5531984566047';
  const msg = `Olá Maker3D! 📐 Gostaria de solicitar um orçamento sob medida (*#${order.id}*):\n\n` +
    `📄 *Arquivo:* ${stlQuoteState.fileName}\n` +
    `🧵 *Material:* ${stlQuoteState.material}\n` +
    `📏 *Escala:* ${stlQuoteState.scalePct}% (Preenchimento: ${stlQuoteState.infill}%)\n` +
    `⚖️ *Peso estimado:* ~${stlQuoteState.estimatedGrams}g (~${stlQuoteState.estimatedHours}h)\n` +
    `💰 *Valor estimado:* R$ ${stlQuoteState.estimatedPrice.toFixed(2).replace('.', ',')}\n` +
    (desc ? `📝 *Observações:* ${desc}\n` : '') +
    `\nPosso enviar o arquivo 3D por aqui?`;

  showToast('🚀 Orçamento salvo! Abrindo WhatsApp...', 'success');
  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }, 600);
}
