document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.product-grid');
    const modal = document.querySelector('.product-modal');

    // Simulação de carregamento do JSON
    fetch('assets/products.json')
        .then(res => res.json())
        .then(products => {
            renderProducts(products);
        });

    function renderProducts(products) {
        grid.innerHTML = products.map(p => `
            <div class="product-card" onclick="openProduct('${p.id}')">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <small>Clique para ver detalhes</small>
            </div>
        `).join('');
        
        // Salva globalmente para o modal
        window.allProducts = products;
    }

    window.openProduct = (id) => {
        const p = window.allProducts.find(item => item.id === id);
        
        modal.innerHTML = `
            <div class="modal-content">
                <button onclick="closeModal()" style="float:right">FECHAR</button>
                
                <div class="image-carousel">
                    <img src="${p.image}" />
                    <model-viewer src="${p.model}" auto-rotate camera-controls></model-viewer>
                </div>

                <h2>${p.name}</h2>
                <p>${p.description}</p>
                
                <span class="product-price">R$ ${p.price}</span>
                
                <button class="buy-button" onclick="checkout('${p.name}')">
                    ADICIONAR AO CARRINHO
                </button>
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Trava o scroll do fundo
    };

    window.closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
});

function checkout(productName) {
    const msg = `Olá! Gostaria de encomendar o ${productName}`;
    window.open(`https://wa.me/SEUNUMERO?text=${encodeURIComponent(msg)}`);
}
