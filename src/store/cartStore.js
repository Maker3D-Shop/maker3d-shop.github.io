import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // ✅ Adiciona item com validação
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            item => item.id === product.id
          );
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          }
          
          return {
            items: [...state.items, { ...product, quantity }]
          };
        });
      },
      
      // ✅ Remove item com índice validado
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },
      
      // ✅ Atualiza quantidade
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === productId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          )
        }));
      },
      
      // ✅ Limpa carrinho
      clearCart: () => set({ items: [] }),
      
      // ✅ Retorna total
      getTotal: () => {
        const state = get();
        return state.items.reduce(
          (sum, item) => sum + (item.price * item.quantity),
          0
        );
      },
      
      // ✅ Compartilha carrinho via URL
      getShareableLink: () => {
        const state = get();
        const encoded = btoa(JSON.stringify(state.items));
        return `https://maker3d-shop.github.io/cart/${encoded}`;
      }
    }),
    {
      name: 'maker3d-cart', // Chave localStorage
      storage: localStorage // Persiste automaticamente
    }
  )
);

export default useCartStore;