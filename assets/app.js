document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    
    // Configura o botão de fechar o modal
    const btnFechar = document.getElementById("btn-fechar-modal");
    if(btnFechar) {
        btnFechar.addEventListener("click", fecharModal);
    }
});

let listaProdutos = [];

// 1. CARREGAR E RENDERIZAR VITRINE
async function carregarProdutos() {
    const grid = document.getElementById("grid-produtos");
    if (!grid) return; 
    
    try {
        const resposta = await fetch("assets/products.json");
        if (!resposta.ok) throw new Error("Erro ao ler JSON");
        
        listaProdutos = await resposta.json();
        grid.innerHTML = ""; // Limpa a mensagem "Carregando..."
        
        listaProdutos.forEach(produto => {
            const card = document.createElement("div");
            card.className = "card-produto";
            card.onclick = () => abrirModal(produto.id);
            
            // Imagem com Fallback caso o caminho do JSON esteja errado
            card.innerHTML = `
                <img src="${produto.image}" alt="${produto.name}" class="card-imagem" onerror="this.src='https://via.placeholder.com/300?text=Sem+Foto'">
                <h3 class="card-titulo">${produto.name}</h3>
                <p style="font-size:12px; color:#ff9e1b; margin-top:5px; font-weight:600;">Ver Detalhes</p>
            `;
            grid.appendChild(card);
        });
        
    } catch (erro) {
        console.error("Erro:", erro);
        grid.innerHTML = "<p>Nossos produtos estão sendo atualizados. Volte em instantes!</p>";
    }
}

// 2. ABRIR TELA DE DETALHES (MODAL)
function abrirModal(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const modal = document.getElementById("modal-produto");
    
    // Injetando Textos
    document.getElementById("modal-titulo").innerText = produto.name;
    document.getElementById("modal-descricao").innerText = produto.description || "Design exclusivo impresso em 3D de alta qualidade.";
    
    // Tratando o Preço com a Cor da Marca
    const precoNum = Number(produto.price);
    const precoFormatado = isNaN(precoNum) ? produto.price : precoNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("modal-preco").innerText = precoFormatado;

    // Injetando Mídia (Imagens e 3D) para Deslizar
    const carrossel = document.getElementById("modal-carrossel");
    carrossel.innerHTML = "";
    if (produto.image) {
        carrossel.innerHTML += `<img src="${produto.image}" class="item-midia" onerror="this.src='https://via.placeholder.com/600?text=Sem+Foto'">`;
    }
    if (produto.model) {
        carrossel.innerHTML += `
            <model-viewer class="item-midia" src="${produto.model}" auto-rotate camera-controls shadow-intensity="1" alt="Modelo 3D de ${produto.name}"></model-viewer>
        `;
    }

    // Gerando o Seletor de Cores dinamicamente
    const areaOpcoes = document.getElementById("modal-opcoes");
    if (produto.cores && produto.cores.length > 0) {
        let opcoesHtml = produto.cores.map(cor => `<option value="${cor}">${cor}</option>`).join('');
        areaOpcoes.innerHTML = `
            <label style="font-size: 13px; font-weight: 700; color: #777; display:block; margin-bottom:5px;">COR DISPONÍVEL:</label>
            <select id="selecao-cor" class="seletor-cor">
                ${opcoesHtml}
            </select>
            <br><br>
        `;
    } else {
        areaOpcoes.innerHTML = ""; // Se não tiver cor no JSON, não mostra nada
    }

    // Configurando Ação de Compra via WhatsApp
    document.getElementById("btn-comprar").onclick = () => {
        let corEscolhida = "";
        const selectCor = document.getElementById("selecao-cor");
        if (selectCor) {
            corEscolhida = ` na cor *${selectCor.value}*`;
        }
        
        // ATENÇÃO: COLOQUE SEU NÚMERO DE WHATSAPP AQUI ABAIXO
        const numeroWhatsApp = "5511999999999"; 
        const mensagem = encodeURIComponent(`Olá, Maker3D! Quero encomendar: *${produto.name}*${corEscolhida}. Vi no site por ${precoFormatado}.`);
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
    };

    // Exibe o modal e bloqueia o scroll do fundo
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// 3. FECHAR MODAL
function fecharModal() {
    document.getElementById("modal-produto").style.display = "none";
    document.body.style.overflow = "auto";
}
