document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    const btnFechar = document.getElementById("btn-fechar-modal");
    if(btnFechar) btnFechar.addEventListener("click", fecharModal);
});

let listaProdutos = [];

async function carregarProdutos() {
    const grid = document.getElementById("grid-produtos");
    if (!grid) return; 
    
    try {
        const resposta = await fetch("assets/products.json");
        if (!resposta.ok) throw new Error("Erro JSON");
        
        let produtos = await resposta.json();
        listaProdutos = produtos; // guarda todos no array global para o modal funcionar
        grid.innerHTML = ""; 
        
        // Verifica se há limite de produtos (ex: apenas 4 na Home)
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
                    <p class="ver-detalhes">Conhecer Produto</p>
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
    
    document.getElementById("modal-titulo").innerText = produto.name;
    document.getElementById("modal-descricao").innerText = produto.description || "Design exclusivo impresso em 3D de alta qualidade com polímeros resistentes.";
    
    const precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(produto.price) || 0);
    document.getElementById("modal-preco").innerText = precoFormatado;

    const carrossel = document.getElementById("modal-carrossel");
    carrossel.innerHTML = "";
    if (produto.image) {
        carrossel.innerHTML += `<img src="${produto.image}" loading="lazy" class="item-midia" onerror="this.src='https://via.placeholder.com/600?text=Maker+3D'">`;
    }
    if (produto.model) {
        carrossel.innerHTML += `<model-viewer class="item-midia" src="${produto.model}" auto-rotate camera-controls shadow-intensity="1"></model-viewer>`;
    }

    const areaOpcoes = document.getElementById("modal-opcoes");
    if (produto.cores && produto.cores.length > 0) {
        let opcoesHtml = produto.cores.map(cor => `<option value="${cor}">${cor}</option>`).join('');
        areaOpcoes.innerHTML = `
            <label style="font-size: 12px; font-weight: 800; color: #6b7280; text-transform: uppercase; display:block; margin-bottom:8px;">Cores Disponíveis</label>
            <select id="selecao-cor" class="seletor-cor">${opcoesHtml}</select>
        `;
    } else {
        areaOpcoes.innerHTML = ""; 
    }

    document.getElementById("btn-comprar").onclick = () => {
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

function fecharModal() {
    document.getElementById("modal-produto").style.display = "none";
    document.body.style.overflow = "auto";
}
