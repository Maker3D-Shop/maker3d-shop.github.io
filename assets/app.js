document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
});

let listaProdutos = [];

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
        if (limite && !isNaN(limite)) {
            produtos = produtos.slice(0, parseInt(limite));
        }
        
        produtos.forEach((produto) => {
            const card = document.createElement("div");
            card.className = "card-produto";
            card.onclick = () => abrirModal(produto.id);
            
            let badgeHtml = produto.badge ? `<span class="badge">${produto.badge}</span>` : ``;

            card.innerHTML = `
                <div class="card-imagem-container">
                    ${badgeHtml}
                    <img src="${produto.image}" alt="${produto.name}" class="card-imagem" loading="lazy">
                </div>
                <div class="card-info">
                    <h3 class="card-titulo">${produto.name}</h3>
                    <p class="ver-detalhes">Ver Detalhes</p>
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (erro) {
        console.error("Erro:", erro);
        grid.innerHTML = "<p style='text-align:center; width:100%;'>Catálogo em atualização. Volte em instantes!</p>";
    }
}

// Funções para manipular a Mídia no Modal
window.trocarFoto = function(src, elemento) {
    const container = document.getElementById('midia-render');
    container.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:contain; animation: fadeInTech 0.3s ease;">`;
    
    // Atualiza o CSS da miniatura ativa
    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('ativo'));
    if(elemento) elemento.classList.add('ativo');
};

window.ativar3D = function(modeloSrc) {
    const container = document.getElementById('midia-render');
    container.innerHTML = `
        <model-viewer 
            src="${modeloSrc}" 
            auto-rotate 
            camera-controls 
            shadow-intensity="1.2" 
            environment-image="neutral" 
            style="width:100%; height:100%; animation: fadeInTech 0.3s ease;">
        </model-viewer>
    `;
    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('ativo'));
};

function abrirModal(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const modal = document.getElementById("modal-produto");
    const precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(produto.price) || 0);

    // 1. Configura a Galeria e o 3D
    // Se o JSON tiver um array "gallery", usa ele. Se não, usa a imagem principal como única foto.
    const fotos = produto.gallery && produto.gallery.length > 0 ? produto.gallery : [produto.image];
    
    let thumbsHtml = fotos.map((foto, index) => 
        `<img src="${foto}" class="thumb-item ${index === 0 ? 'ativo' : ''}" onclick="trocarFoto('${foto}', this)">`
    ).join('');

    let btn3DHtml = produto.model ? 
        `<button class="btn-ativar-3d" onclick="ativar3D('${produto.model}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            Ver em 3D
        </button>` : '';

    // 2. Configura as Cores
    let opcoesHtml = '';
    if (produto.cores && produto.cores.length > 0) {
        let options = produto.cores.map(cor => `<option value="${cor}">${cor}</option>`).join('');
        opcoesHtml = `
            <div style="margin-bottom: 25px;">
                <label style="font-size: 12px; font-weight: 800; color: var(--texto-light); text-transform: uppercase; display:block; margin-bottom: 8px;">Opções de Cor</label>
                <select id="selecao-cor" class="seletor-cor" style="width: 100%;">${options}</select>
            </div>
        `;
    }

    // 3. Monta o Modal Tech-Luxury
    modal.innerHTML = `
        <div class="modal-conteudo">
            <button class="luxo-btn-voltar" onclick="fecharModal()">✕</button>
            
            <div class="luxo-grid">
                <div class="luxo-midia-container">
                    <div class="luxo-midia-principal">
                        <div id="midia-render" style="width:100%; height:100%;">
                            <img src="${fotos[0]}" style="width:100%; height:100%; object-fit:contain;">
                        </div>
                        ${btn3DHtml}
                    </div>
                    <div class="galeria-thumbs">
                        ${thumbsHtml}
                    </div>
                </div>

                <div class="luxo-info">
                    <h2>${produto.name}</h2>
                    <div class="luxo-preco">${precoFormatado}</div>
                    <div class="luxo-desc">${produto.description || 'Produto exclusivo fabricado sob demanda. Entrega com acabamento impecável e alta precisão estrutural.'}</div>
                    
                    ${opcoesHtml}
                    
                    <button id="btn-comprar-modal" class="luxo-btn-comprar">ADICIONAR AO PEDIDO</button>
                    
                    <div class="luxo-beneficios">
                        <div class="beneficio-item">
                            <span class="beneficio-icone">📦</span>
                            <span><b>Produção Segura:</b> Envio cuidadoso para todo o Brasil.</span>
                        </div>
                        <div class="beneficio-item">
                            <span class="beneficio-icone">🛡️</span>
                            <span><b>Qualidade Garantida:</b> Peça 100% inspecionada.</span>
                        </div>
                        <div class="beneficio-item">
                            <span class="beneficio-icone">♻️</span>
                            <span><b>Material Tech:</b> Polímeros de alta performance.</span>
                        </div>
                    </div>
                    
                    <div class="luxo-especificacoes">
                        <b>Especificações Técnicas:</b><br>
                        Fabricado através de manufatura aditiva (Impressão 3D). Recomendamos não expor peças em PLA a temperaturas superiores a 50°C. Limpeza apenas com pano levemente umedecido.
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ação do WhatsApp
    document.getElementById("btn-comprar-modal").onclick = () => {
        let corEscolhida = "";
        const selectCor = document.getElementById("selecao-cor");
        if (selectCor) corEscolhida = ` na cor *${selectCor.value}*`;
        
        const numeroWhatsApp = "5531984566047"; 
        const mensagem = encodeURIComponent(`Olá, Maker3D! Quero encomendar: *${produto.name}*${corEscolhida}. Vi por ${precoFormatado}.`);
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
    };

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

window.fecharModal = function() {
    const modal = document.getElementById("modal-produto");
    if(modal) {
        modal.style.display = "none";
        modal.innerHTML = ""; 
    }
    document.body.style.overflow = "auto";
};
