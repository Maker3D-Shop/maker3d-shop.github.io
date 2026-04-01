document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    document.getElementById("btn-fechar-modal").addEventListener("click", fecharModal);
});

let listaProdutos = [];

// 1. CARREGAR JSON
async function carregarProdutos() {
    const grid = document.getElementById("grid-produtos");
    if (!grid) return; // Evita erro se a página não tiver a grade (ex: contato.html)
    
    try {
        const resposta = await fetch("assets/products.json");
        if (!resposta.ok) throw new Error("Erro ao carregar o JSON");
        
        listaProdutos = await resposta.json();
        grid.innerHTML = "";
        
        listaProdutos.forEach(produto => {
            const card = document.createElement("div");
            card.className = "card-produto";
            card.onclick = () => abrirModal(produto.id);
            
            card.innerHTML = `
                <img src="${produto.image}" alt="${produto.name}" class="card-imagem" onerror="this.src='https://via.placeholder.com/300?text=Sem+Foto'">
                <h3 class="card-titulo">${produto.name}</h3>
            `;
            grid.appendChild(card);
        });
        
    } catch (erro) {
        console.error("Erro:", erro);
        grid.innerHTML = "<p>Não foi possível carregar os produtos no momento.</p>";
    }
}

// 2. ABRIR MODAL DO PRODUTO (Agora com Cores!)
function abrirModal(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const modal = document.getElementById("modal-produto");
    const carrossel = document.getElementById("modal-carrossel");
    const areaOpcoes = document.getElementById("modal-opcoes"); // Onde vamos por as cores
    
    document.getElementById("modal-titulo").innerText = produto.name;
    document.getElementById("modal-descricao").innerText = produto.description || "Design exclusivo impresso em 3D.";
    
    const precoFormatado = Number(produto.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("modal-preco").innerText = precoFormatado !== "R$ NaN" ? precoFormatado : produto.price;

    // Carrossel
    carrossel.innerHTML = "";
    if (produto.image) {
        carrossel.innerHTML += `<img src="${produto.image}" class="item-midia">`;
    }
    if (produto.model) {
        carrossel.innerHTML += `
            <model-viewer class="item-midia" src="${produto.model}" auto-rotate camera-controls shadow-intensity="1"></model-viewer>
        `;
    }

    // Renderizar Cores (Se existirem no JSON)
    let selectCorHTML = "";
    if (produto.cores && produto.cores.length > 0) {
        let opcoes = produto.cores.map(cor => `<option value="${cor}">${cor}</option>`).join('');
        selectCorHTML = `
            <div style="margin-bottom: 15px; text-align: left;">
                <label style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Escolha a Cor:</label>
                <select id="selecao-cor" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px;">
                    ${opcoes}
                </select>
            </div>
        `;
    }
    // Injeta o seletor de cor no HTML do modal (precisamos adicionar essa div no HTML depois)
    if(areaOpcoes) areaOpcoes.innerHTML = selectCorHTML;

    // Configura Botão Comprar (Puxando a cor selecionada)
    document.getElementById("btn-comprar").onclick = () => {
        let corEscolhida = "";
        const selectCor = document.getElementById("selecao-cor");
        if (selectCor) {
            corEscolhida = ` na cor *${selectCor.value}*`;
        }
        
        const numeroWhatsApp = "5511999999999"; // COLOQUE SEU NÚMERO
        const mensagem = encodeURIComponent(`Olá! Gostaria de encomendar: *${produto.name}*${corEscolhida}.`);
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
    };

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function fecharModal() {
    document.getElementById("modal-produto").style.display = "none";
    document.body.style.overflow = "auto";
}
