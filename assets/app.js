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
            
            let badgeHtml = produto.category ? `<span class="badge">${produto.category}</span>` : ``;

            // Formata o preço da vitrine (Lida com o null)
            let precoDisplay = "Sob Consulta";
            if (produto.price !== null) {
                precoDisplay = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(produto.price));
            }

            card.innerHTML = `
                <div class="card-imagem-container">
                    ${badgeHtml}
                    <img src="${produto.image}" alt="${produto.name}" class="card-imagem" loading="lazy">
                </div>
                <div class="card-info">
                    <h3 class="card-titulo">${produto.name}</h3>
                    <p style="font-size:14px; color:var(--texto-dark); font-weight:700; margin-bottom: 8px;">${precoDisplay}</p>
                    <p class="ver-detalhes">Configurar Produto</p>
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (erro) {
        console.error("Erro:", erro);
        grid.innerHTML = "<p style='text-align:center; width:100%;'>Catálogo em atualização. Volte em instantes!</p>";
    }
}

// Troca de imagens no Modal
window.trocarFoto = function(src, elemento) {
    const container = document.getElementById('midia-render');
    container.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:contain; animation: fadeInTech 0.3s ease;">`;
    document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('ativo'));
    if(elemento) elemento.classList.add('ativo');
};

// Visualizador 3D
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
    
    // Tratamento de Preço nulo
    let precoFormatado = "Preço Sob Consulta (Depende do Tamanho/Cor)";
    if (produto.price !== null) {
        precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(produto.price));
    }

    // Galeria de Fotos
    const fotos = produto.gallery && produto.gallery.length > 0 ? produto.gallery : [produto.image];
    let thumbsHtml = fotos.map((foto, index) => 
        `<img src="${foto}" class="thumb-item ${index === 0 ? 'ativo' : ''}" onclick="trocarFoto('${foto}', this)">`
    ).join('');

    let btn3DHtml = produto.modelUrl ? 
        `<button class="btn-ativar-3d" onclick="ativar3D('${produto.modelUrl}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            Ver em 3D
        </button>` : '';

    // ==========================================
    // LÓGICA DE OPÇÕES (Tamanho, Material, etc)
    // ==========================================
    let opcoesExtrasHtml = '';
    if (produto.options && produto.options.length > 0) {
        opcoesExtrasHtml = produto.options.map((opt, i) => {
            let selectOptions = opt.values.map(val => `<option value="${val}">${val}</option>`).join('');
            return `
                <div style="margin-bottom: 15px;">
                    <label style="font-size: 11px; font-weight: 800; color: var(--texto-light); text-transform: uppercase;">${opt.name}</label>
                    <select id="extra-opt-${i}" class="seletor-cor" data-nome="${opt.name}" style="width: 100%; margin-top:5px; padding: 12px;">${selectOptions}</select>
                </div>
            `;
        }).join('');
    }

    // ==========================================
    // LÓGICA DE CORES (Sólida vs Multicor)
    // ==========================================
    let paletaHtml = '';
    if (produto.colorConfig) {
        const paletaOpcoes = produto.colorConfig.palette.map(cor => `<option value="${cor}">${cor}</option>`).join('');
        
        // Se for Multicor e tiver as partes definidas (ex: Caixa de coração)
        if (produto.colorConfig.defaultMode === "multi" && produto.colorConfig.multiParts) {
            paletaHtml = produto.colorConfig.multiParts.map((parte, idx) => `
                <div style="margin-bottom: 15px; flex: 1; min-width: 140px;">
                    <label style="font-size: 11px; font-weight: 800; color: var(--laranja); text-transform: uppercase;">Cor: ${parte}</label>
                    <select class="seletor-cor multi-color-select" data-parte="${parte}" style="width: 100%; margin-top:5px; padding: 12px;">
                        ${paletaOpcoes}
                    </select>
                </div>
            `).join('');
            
            paletaHtml = `<div style="display:flex; flex-wrap:wrap; gap:10px;">${paletaHtml}</div>`;
        } 
        // Se for modo Sólido normal
        else {
            paletaHtml = `
                <div style="margin-bottom: 20px;">
                    <label style="font-size: 11px; font-weight: 800; color: var(--texto-light); text-transform: uppercase;">Escolha a Cor</label>
                    <select id="single-color-select" class="seletor-cor" style="width: 100%; margin-top:5px; padding: 12px;">
                        ${paletaOpcoes}
                    </select>
                </div>
            `;
        }
    }

    // Injeta o HTML no Modal
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
                    <h2>${produto.name} <span style="font-size: 20px;">${produto.dimensions || ''}</span></h2>
                    <div class="luxo-preco" style="font-size: 22px;">${precoFormatado}</div>
                    <div class="luxo-desc">${produto.description.replace(/\n/g, '<br>')}</div>
                    
                    <div style="background: #fcfcfc; padding: 20px; border-radius: 16px; margin-bottom: 25px; border: 1px solid #eee;">
                        <h4 style="margin-bottom:15px; font-size:14px;">Personalize seu pedido:</h4>
                        ${opcoesExtrasHtml}
                        ${paletaHtml}
                    </div>
                    
                    <button id="btn-comprar-modal" class="luxo-btn-comprar">ADICIONAR AO PEDIDO</button>
                    
                    <div class="luxo-beneficios">
                        <div class="beneficio-item"><span class="beneficio-icone">📦</span><span><b>Produção Segura:</b> Envio cuidadoso para todo o Brasil.</span></div>
                        <div class="beneficio-item"><span class="beneficio-icone">🛡️</span><span><b>Qualidade Garantida:</b> Peça 100% inspecionada.</span></div>
                        <div class="beneficio-item"><span class="beneficio-icone">♻️</span><span><b>Material Tech:</b> Polímeros de alta performance.</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Constrói a Mensagem do WhatsApp lendo todos os selects que foram gerados
    document.getElementById("btn-comprar-modal").onclick = () => {
        let msgPersonalizacao = "";

        // Pega as opções extras (Material, Tamanho, etc)
        const extras = document.querySelectorAll('[id^="extra-opt-"]');
        extras.forEach(select => {
            msgPersonalizacao += `%0A- ${select.getAttribute('data-nome')}: *${select.value}*`;
        });

        // Pega as cores (Se for Multicor)
        const multiCores = document.querySelectorAll('.multi-color-select');
        if (multiCores.length > 0) {
            multiCores.forEach(select => {
                msgPersonalizacao += `%0A- Cor da ${select.getAttribute('data-parte')}: *${select.value}*`;
            });
        }

        // Pega a cor (Se for Sólido)
        const corSolida = document.getElementById('single-color-select');
        if (corSolida) {
            msgPersonalizacao += `%0A- Cor: *${corSolida.value}*`;
        }
        
        const numeroWhatsApp = "5531984566047"; 
        const mensagem = `Olá, Maker3D! Quero encomendar: %0A%0A*${produto.name}*${msgPersonalizacao}%0A%0AValor Base: ${precoFormatado}`;
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
