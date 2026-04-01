// Dados dos produtos (Simulando o carregamento do JSON)
async function loadProducts() {
    try {
        const response = await fetch('assets/products.json');
        const products = await response.json();
        renderGrid(products);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

function renderGrid(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openProduct('${p.id}', ${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p style="font-size: 11px; color: #999;">Ver detalhes</p>
        </div>
    `).join('');
}

function openProduct(id, data) {
    const modal = document.getElementById('productModal');
    
    // Preenche as informações
    document.getElementById('modalTitle').innerText = data.name;
    document.getElementById('modalDescription').innerText = data.description;
    document.getElementById('modalPrice').innerText = `R$ ${data.price}`;
    
    // Configura o visual (Prioriza 3D se existir, se não, imagem)
    const visualsContainer = document.getElementById('modalVisuals');
    if(data.model) {
        visualsContainer.innerHTML = `
            <model-viewer src="${data.model}" 
                poster="${data.image}"
                auto-rotate camera-controls 
                shadow-intensity="1">
            </model-viewer>`;
    } else {
        visualsContainer.innerHTML = `<img src="${data.image}" style="width:100%; height:100%; object-fit:contain;">`;
    }

    // Configura o botão de WhatsApp
    document.getElementById('btnBuy').onclick = () => {
        const text = encodeURIComponent(`Olá! Tenho interesse no ${data.name} que vi no site.`);
        window.open(`https://wa.me/5511999999999?text=${text}`, '_blank');
    };

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Impede scroll atrás do modal
}

function closeProduct() {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Inicializa
loadProducts();
