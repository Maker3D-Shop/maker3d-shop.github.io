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
            
            let badgeHtml = produto.badge ? `<span class="badge">${produto.badge}</span>` : `<span class="badge">Destaque</span>`;

            card.innerHTML = `
                <div class="card-imagem-container">
                    ${badgeHtml}
                    <img src="${produto.image}" alt="${produto.name}" class="card-imagem" loading="lazy" onerror="this.src='https://via.placeholder.com/400?text=Maker+3D'">
                </div>
                <div class="card-info">
                    <h3 class="card-titulo">${produto.name}</h3>
                    <p class="ver-detalhes">Descobrir Produto</p>
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (erro) {
        console.error("Erro:", erro);
        grid.innerHTML = "<p style='text-align:center; width:100%;'>Catálogo em atualização. Volte em instantes!</p>";
    }
}

function abrirModal(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const modal = document.getElementById("modal-produto");
    const precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(produto.price) || 0);

    // Constrói a mídia (Se tiver 3D, mostra o 3D interativo, se não, a foto)
    let midiaPrincipal = '';
    if (produto.model) {
        midiaPrincipal = `<model-viewer src="${produto.model}" auto-rotate camera-controls shadow-intensity="1.5" environment-image="neutral" exposure="1.2"></model-viewer>`;
    } else {
        midiaPrincipal = `<img src="${produto.image}" onerror="this.src='https://via.placeholder.com/600?text=Maker+3D'">`;
    }

    // Constrói as opções de Cores
    let opcoesHtml = '';
    if (produto.cores && produto.cores.length > 0) {
        let options = produto.cores.map(cor => `<option value="${cor}">${cor}</option>`).join('');
        opcoesHtml = `
            <div style="margin-bottom: 25px;">
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #888; display:block; margin-bottom: 5px;">Selecione a Cor</label>
                <select id="selecao-cor" class="seletor-cor" style="width: 100%; border-radius: 0; border: 1px solid #ccc;">${options}</select>
            </div>
        `;
    }

    // Injeta o Layout Cartier inteiro dentro do Modal
    modal.innerHTML = `
        <button class="luxo-btn-voltar" onclick="fecharModal()">✕ FECHAR</button>
        <div class="modal-conteudo">
            
            <div class="luxo-grid">
                <div class="luxo-midia-container">
                    <div class="luxo-midia-principal">
                        ${midiaPrincipal}
                    </div>
                </div>

                <div class="luxo-info">
                    <h2>${produto.name}</h2>
                    <div class="luxo-preco">${precoFormatado}</div>
                    <div class="luxo-desc">${produto.description || 'Uma obra de precisão e design. Impressa em alta resolução para entregar detalhes perfeitos e resistência estrutural.'}</div>
                    
                    ${opcoesHtml}
                    
                    <button id="btn-comprar-luxo" class="luxo-btn-comprar">ADICIONAR AO PEDIDO</button>
                    
                    <div class="luxo-beneficios">
                        <p>📦 <b>Entrega Segura:</b> Produção e envio cuidadoso para todo o Brasil.</p>
                        <p>🛡️ <b>Qualidade Garantida:</b> Peça inspecionada contra falhas.</p>
                        <p>♻️ <b>Material:</b> Polímeros de alta performance.</p>
                    </div>
                </div>
            </div>

            <div class="luxo-especificacoes">
                <h3>ESPECIFICAÇÕES DO PRODUTO</h3>
                <p style="font-size: 14px; color: #555; line-height: 1.8;">
                    Nossos produtos são fabricados através de manufatura aditiva (Impressão 3D) de última geração. 
                    Recomendamos não expor peças em PLA a temperaturas superiores a 50°C. 
                    A limpeza deve ser feita apenas com um pano levemente umedecido. 
                    <br><br><b>Design e fabricação por Maker3D Shop.</b>
                </p>
            </div>

        </div>
    `;

    // Ação de Compra
    document.getElementById("btn-comprar-luxo").onclick = () => {
        let corEscolhida = "";
        const selectCor = document.getElementById("selecao-cor");
        if (selectCor) corEscolhida = ` na cor *${selectCor.value}*`;
        
        const numeroWhatsApp = "5531984566047"; 
        const mensagem = encodeURIComponent(`Olá, Maker3D! Quero encomendar: *${produto.name}*${corEscolhida}. Vi por ${precoFormatado}.`);
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
    };

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function fecharModal() {
    const modal = document.getElementById("modal-produto");
    if(modal) {
        modal.style.display = "none";
        modal.innerHTML = ""; // Limpa o modal para a próxima vez
    }
    document.body.style.overflow = "auto";
}
