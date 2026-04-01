document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();

    // Evento para fechar o modal
    document.getElementById("btn-fechar-modal").addEventListener("click", fecharModal);
});

// Array global para guardar os produtos carregados
let listaProdutos = [];

// 1. CARREGAR JSON
async function carregarProdutos() {
    const grid = document.getElementById("grid-produtos");
    
    try {
        const resposta = await fetch("assets/products.json");
        if (!resposta.ok) throw new Error("Erro ao carregar o JSON");
        
        listaProdutos = await resposta.json();
        
        // Limpa o texto de "Carregando"
        grid.innerHTML = "";
        
        // 2. RENDERIZAR VITRINE (Sem preço)
        listaProdutos.forEach(produto => {
            const card = document.createElement("div");
            card.className = "card-produto";
            
            // Lógica de clique no card
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

// 3. ABRIR MODAL DO PRODUTO
function abrirModal(idProduto) {
    const produto = listaProdutos.find(p => p.id === idProduto);
    if (!produto) return;

    const modal = document.getElementById("modal-produto");
    const carrossel = document.getElementById("modal-carrossel");
    
    // Preenche os textos básicos
    document.getElementById("modal-titulo").innerText = produto.name;
    document.getElementById("modal-descricao").innerText = produto.description || "Inovação e qualidade em impressão 3D.";
    
    // Formata e exibe o preço (Destaque principal)
    // Se o preço no JSON for número (ex: 45.9), formatamos para Real.
    const precoFormatado = Number(produto.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("modal-preco").innerText = precoFormatado !== "R$ NaN" ? precoFormatado : produto.price;

    // Configura o Carrossel Deslizável (Imagem e 3D)
    carrossel.innerHTML = ""; // Limpa anterior
    
    // Se tiver imagem, adiciona como primeiro item do carrossel
    if (produto.image) {
        carrossel.innerHTML += `<img src="${produto.image}" class="item-midia">`;
    }
    
    // Se tiver modelo 3D (.glb), adiciona como segundo item para o usuário deslizar
    if (produto.model) {
        carrossel.innerHTML += `
            <model-viewer class="item-midia"
                src="${produto.model}" 
                auto-rotate 
                camera-controls 
                shadow-intensity="1">
            </model-viewer>
        `;
    }

    // Configura o botão de WhatsApp
    document.getElementById("btn-comprar").onclick = () => {
        // COLOQUE SEU NÚMERO AQUI (com código do país e DDD, ex: 5511999999999)
        const numeroWhatsApp = "5511999999999"; 
        const mensagem = encodeURIComponent(`Olá! Gostaria de encomendar o produto: ${produto.name}.`);
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
    };

    // Mostra o modal e trava o fundo da página
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// 4. FECHAR MODAL
function fecharModal() {
    const modal = document.getElementById("modal-produto");
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Libera o fundo
}
