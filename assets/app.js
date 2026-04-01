document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    const btnFechar = document.getElementById("btn-fechar-modal");
    if(btnFechar) btnFechar.addEventListener("click", fecharModal);
});

let listaProdutos = [];

// 1. CARREGAR E RENDERIZAR COM ANIMAÇÃO STAGGER
async function carregarProdutos() {
    const grid = document.getElementById("grid-produtos");
    if (!grid) return; 
    
    try {
        const resposta = await fetch("assets/products.json");
        if (!resposta.ok) throw new Error("Erro de rede");
        
        listaProdutos = await resposta.json();
        grid.innerHTML = ""; 
        
        listaProdutos.forEach((produto, index) => {
            const card = document.createElement("div");
            card.className = "card-produto";
            card.style.animationDelay = `${index * 0.1}s`; // Efeito cascata
            card.onclick = () => abrirModal(produto.id);
            
            // Lógica de Badge se existir
            let badgeHtml = produto.badge ? `<span class="badge-dica">${produto.badge}</span>` : `<span class="badge-dica">Toque</span>`;

            card.innerHTML = `
                <div class="card-imagem-container">
                    ${badgeHtml}
                    <img src="${produto.image}" alt="${produto.name}" class="card-imagem" loading="lazy" onerror="this.src='https://via.placeholder.com/400?text=Maker+3D'">
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
        grid.innerHTML = "<p style='text-align:center; width:100%;'>Atualizando catálogo. Tente novamente em breve.</p>";
    }
}

// 2. MODAL AVANÇADO
function abrirModal(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const modal = document.getElementById("modal-produto");
    
    document.getElementById("modal-titulo").innerText = produto.name;
    document.getElementById("modal-descricao").innerText = produto.description || "Design exclusivo impresso em 3D de alta qualidade com polímeros resistentes.";
    
    // Formatação de Preço Perfeita
    const precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(produto.price) || 0);
    document.getElementById("modal-preco").innerText = precoFormatado;

    // Mídia
    const carrossel = document.getElementById("modal-carrossel");
    carrossel.innerHTML = "";
    if (produto.image) {
        carrossel.innerHTML += `<img src="${produto.image}" loading="lazy" class="item-midia" onerror="this.src='https://via.placeholder.com/600?text=Maker+3D'">`;
    }
    if (produto.model) {
        carrossel.innerHTML += `<model-viewer class="item-midia" src="${produto.model}" auto-rotate camera-controls shadow-intensity="1"></model-viewer>`;
    }

    // Cores
    const areaOpcoes = document.getElementById("modal-opcoes");
    if (produto.cores && produto.cores.length > 0) {
        let opcoesHtml = produto.cores.map(cor => `<option value="${cor}">${cor}</option>`).join('');
        areaOpcoes.innerHTML = `
            <label style="font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; display:block; margin-bottom:8px; letter-spacing:1px;">Escolha a Cor</label>
            <select id="selecao-cor" class="seletor-cor">${opcoesHtml}</select>
        `;
    } else {
        areaOpcoes.innerHTML = ""; 
    }

    // Ação WhatsApp (Dentro da função abrirModal)
    document.getElementById("btn-comprar").onclick = () => {
        let corEscolhida = "";
        const selectCor = document.getElementById("selecao-cor");
        if (selectCor) corEscolhida = ` na cor *${selectCor.value}*`;
        
        // SEU NÚMERO E DDD AQUI (55 Brasil + 31 DDD + Número)
        const numeroWhatsApp = "5531984566047"; 
        
        const mensagem = encodeURIComponent(`Olá, Maker3D! Gostaria de encomendar: *${produto.name}*${corEscolhida}. Vi no site por ${precoFormatado}.`);
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
    };

    modal.style.display = "flex"; // Flex para centralizar
    document.body.style.overflow = "hidden";
}

function fecharModal() {
    document.getElementById("modal-produto").style.display = "none";
    document.body.style.overflow = "auto";
}
