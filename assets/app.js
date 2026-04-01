document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    atualizarContadorCarrinho();
});

let listaProdutos = [];
let carrinho = JSON.parse(localStorage.getItem('maker3d_carrinho')) || [];

// ==========================================
// 1. CARREGAR VITRINE
// ==========================================
async function carregarProdutos() {
    const grid = document.getElementById("grid-produtos");
    if (!grid) return; 
    
    try {
        const resposta = await fetch("assets/products.json");
        if (!resposta.ok) throw new Error("Erro JSON");
        
        let produtos = await resposta.json();
        listaProdutos = produtos; 
        grid.innerHTML = ""; 
        
        const limite = grid.getAttribute("data-limit");
        if (limite && !isNaN(limite)) produtos = produtos.slice(0, parseInt(limite));
        
        produtos.forEach((produto) => {
            const card = document.createElement("div");
            card.className = "card-produto";
            card.onclick = () => abrirModal(produto.id);
            
            let badgeHtml = produto.category ? `<span class="badge">${produto.category}</span>` : ``;

            card.innerHTML = `
                <div class="card-imagem-container">
                    ${badgeHtml}
                    <img src="${produto.image}" alt="${produto.name}" class="card-imagem" loading="lazy">
                </div>
                <div class="card-info">
                    <h3 class="card-titulo">${produto.name}</h3>
                    <p class="ver-detalhes">CONFERIR</p>
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (erro) {
        grid.innerHTML = "<p style='text-align:center; width:100%;'>Catálogo em atualização.</p>";
    }
}

// ==========================================
// 2. MODAL DE PRODUTO
// ==========================================
window.trocarFoto = function(src, elemento) {
    document.getElementById('midia-render').innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:contain; animation: popIn 0.3s ease;">`;
    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('ativo'));
    if(elemento) elemento.classList.add('ativo');
};

window.ativar3D = function(modeloSrc) {
    document.getElementById('midia-render').innerHTML = `<model-viewer src="${modeloSrc}" auto-rotate camera-controls shadow-intensity="1.2" environment-image="neutral" style="width:100%; height:100%; animation: popIn 0.3s ease;"></model-viewer>`;
    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('ativo'));
};

function abrirModal(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const modal = document.getElementById("modal-produto");
    
    let precoDisplay = "Sob Consulta";
    let precoNumerico = 0;
    if (produto.price !== null) {
        precoNumerico = Number(produto.price);
        precoDisplay = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoNumerico);
    }

    const fotos = produto.gallery && produto.gallery.length > 0 ? produto.gallery : [produto.image];
    let thumbsHtml = fotos.map((foto, idx) => `<img src="${foto}" class="thumb-item ${idx === 0 ? 'ativo' : ''}" onclick="trocarFoto('${foto}', this)">`).join('');
    let btn3DHtml = produto.modelUrl ? `<button class="btn-ativar-3d" onclick="ativar3D('${produto.modelUrl}')">Ver em 3D</button>` : '';

    let opcoesHtml = '';
    if (produto.options) {
        opcoesHtml += produto.options.map((opt, i) => `
            <div style="margin-bottom: 12px;">
                <label style="font-size: 11px; font-weight: 800; color: var(--texto-light); text-transform: uppercase;">${opt.name}</label>
                <select class="seletor-cor class-opcao-extra" data-nome="${opt.name}" style="margin-top:5px;">
                    ${opt.values.map(v => `<option value="${v}">${v}</option>`).join('')}
                </select>
            </div>
        `).join('');
    }

    if (produto.colorConfig) {
        const paleta = produto.colorConfig.palette.map(c => `<option value="${c}">${c}</option>`).join('');
        if (produto.colorConfig.defaultMode === "multi" && produto.colorConfig.multiParts) {
            let partsHtml = produto.colorConfig.multiParts.map(parte => `
                <div style="flex: 1; min-width: 120px; margin-bottom: 10px;">
                    <label style="font-size: 11px; font-weight: 800; color: var(--laranja); text-transform: uppercase;">Cor: ${parte}</label>
                    <select class="seletor-cor class-opcao-cor" data-nome="Cor (${parte})" style="margin-top:5px;">${paleta}</select>
                </div>
            `).join('');
            opcoesHtml += `<div style="display:flex; flex-wrap:wrap; gap:10px;">${partsHtml}</div>`;
        } else {
            opcoesHtml += `
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; font-weight: 800; color: var(--texto-light); text-transform: uppercase;">Escolha a Cor</label>
                    <select class="seletor-cor class-opcao-cor" data-nome="Cor" style="margin-top:5px;">${paleta}</select>
                </div>
            `;
        }
    }

    let personalizacaoContainer = opcoesHtml ? `<div class="caixa-personalizacao"><h4 style="margin-bottom:15px; font-size:14px; color:var(--texto-dark);">Personalize o Pedido:</h4>${opcoesHtml}</div>` : '';

    modal.innerHTML = `
        <div class="modal-conteudo">
            <button class="luxo-btn-voltar" onclick="fecharModal()">✕</button>
            <div class="luxo-grid">
                <div class="luxo-midia-container">
                    <div class="luxo-midia-principal">
                        <div id="midia-render" style="width:100%; height:100%;"><img src="${fotos[0]}" style="width:100%; height:100%; object-fit:contain;"></div>
                        ${btn3DHtml}
                    </div>
                    <div class="galeria-thumbs">${thumbsHtml}</div>
                </div>
                <div class="luxo-info">
                    <h2>${produto.name} <span style="font-size: 18px; color:var(--texto-light);">${produto.dimensions || ''}</span></h2>
                    <div class="luxo-preco">${precoDisplay}</div>
                    <div class="luxo-desc">${produto.description.replace(/\n/g, '<br>')}</div>
                    
                    ${personalizacaoContainer}
                    
                    <button class="luxo-btn-comprar" onclick="adicionarAoCarrinho('${produto.id}', '${produto.name}', '${fotos[0]}', ${precoNumerico})">ADICIONAR AO CARRINHO</button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

window.fecharModal = function() {
    const modal = document.getElementById("modal-produto");
    if(modal) { modal.style.display = "none"; modal.innerHTML = ""; }
    document.body.style.overflow = "auto";
};

// ==========================================
// 3. LÓGICA DO CARRINHO
// ==========================================
window.abrirCarrinho = function() {
    document.getElementById("carrinho-sidebar").classList.add("ativo");
    document.getElementById("carrinho-overlay").classList.add("ativo");
    renderizarCarrinho();
}

window.fecharCarrinho = function() {
    document.getElementById("carrinho-sidebar").classList.remove("ativo");
    document.getElementById("carrinho-overlay").classList.remove("ativo");
}

window.adicionarAoCarrinho = function(id, nome, imagem, preco) {
    let configuracoes = [];
    document.querySelectorAll('.class-opcao-extra, .class-opcao-cor').forEach(select => {
        configuracoes.push(`${select.getAttribute('data-nome')}: ${select.value}`);
    });

    const item = { id, nome, imagem, preco: Number(preco) || 0, config: configuracoes.join(' | ') };
    carrinho.push(item);
    
    salvarCarrinho();
    fecharModal();
    mostrarToast("✅ Produto adicionado ao carrinho!");
}

window.removerDoCarrinho = function(index) {
    carrinho.splice(index, 1);
    salvarCarrinho();
    renderizarCarrinho();
}

function salvarCarrinho() {
    localStorage.setItem('maker3d_carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
    const counts = document.querySelectorAll('.cart-count-badge');
    counts.forEach(c => c.innerText = carrinho.length);
}

function renderizarCarrinho() {
    const container = document.getElementById("carrinho-items");
    const totalEl = document.getElementById("cart-total");
    
    if (carrinho.length === 0) {
        container.innerHTML = `<div class="cart-vazio">Seu carrinho está vazio.</div>`;
        totalEl.innerText = "R$ 0,00";
        return;
    }

    let html = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;
        let precoStr = item.preco > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco) : 'Sob Consulta';
        
        html += `
            <div class="cart-item">
                <img src="${item.imagem}" alt="${item.nome}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nome}</div>
                    <div class="cart-item-opts">${item.config}</div>
                    <div class="cart-item-price">${precoStr}</div>
                </div>
                <button class="btn-remove-item" onclick="removerDoCarrinho(${index})">✕</button>
            </div>
        `;
    });

    container.innerHTML = html;
    totalEl.innerText = total > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total) : 'Sob Consulta';
}

window.finalizarCompra = function() {
    if (carrinho.length === 0) return alert("Adicione produtos ao carrinho primeiro!");

    let mensagem = `Olá, Maker3D! Gostaria de finalizar o meu pedido:%0A%0A`;
    let total = 0;

    carrinho.forEach((item, i) => {
        total += item.preco;
        let precoStr = item.preco > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco) : 'Sob Consulta';
        mensagem += `*${i+1}. ${item.nome}*%0A`;
        if (item.config) mensagem += `↳ Detalhes: ${item.config}%0A`;
        mensagem += `↳ Valor: ${precoStr}%0A%0A`;
    });

    let totalStr = total > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total) : 'Sob Consulta';
    mensagem += `*TOTAL APROXIMADO: ${totalStr}*`;

    const numeroWhatsApp = "5531984566047"; 
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
}

// TOAST NOTIFICATIONS
function mostrarToast(mensagem) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensagem;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}
