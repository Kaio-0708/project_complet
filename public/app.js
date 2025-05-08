const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const nameInput = document.getElementById("name");
const nameWarn = document.getElementById("name-warn");
const cpfInput = document.getElementById("cpf");
const cpfWarn = document.getElementById("cpf-warn");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const emailInput = document.getElementById("email");
const emailWarn = document.getElementById("email-warn");
const checkoutStripeBtn = document.getElementById("checkout-stripe");
const paymentModal = document.getElementById("payment-modal");
const cancelPaymentBtn = document.getElementById("cancel-payment-btn");

let cart = [];

// Abre o modal do carrinho ao clicar no botão
cartBtn.addEventListener("click", function() {
  updateCartModal();
  cartModal.style.display = "flex";
});

// Fecha o modal do carrinho ao clicar fora dele
cartModal.addEventListener("click", function(event) {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

// Fecha o modal do carrinho ao clicar no botão de fechar
closeModalBtn.addEventListener("click", function() {
  cartModal.style.display = "none";
});

// Adiciona itens ao carrinho quando o botão "Adicionar ao Carrinho" é clicado
menu.addEventListener("click", function(event) {
  let parentButton = event.target.closest(".add-to-cart-btn");

  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(name, price);
  }
});

// Função para adicionar itens ao carrinho
function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal();
}

// Atualiza o modal do carrinho com os itens e o total
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");
        
    cartItemElement.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="font-bold">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
      </div>
    `;

    total += item.price * item.quantity;
    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  cartCounter.textContent = cart.length;
}

// Remove itens do carrinho
cartItemsContainer.addEventListener("click", function(event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");

        removeItemCart(name);
    }
});

// Função para remover itens do carrinho
function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartModal();
    }
}

nameInput.addEventListener("input", function(event) {
    if (event.target.value !== "") {
        nameInput.classList.remove("border-red-500");
        nameWarn.classList.add("hidden");
    }
});

// Validação em tempo real para o campo de CPF
cpfInput.addEventListener("input", function(event) {
    if (event.target.value !== "") {
        cpfInput.classList.remove("border-red-500");
        cpfWarn.classList.add("hidden");
    }
});

// Validação em tempo real para o campo de endereço
addressInput.addEventListener("input", function(event) {
    if (event.target.value !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

// Validação em tempo real para o campo de email
emailInput.addEventListener("input", function(event) {
    if (event.target.value !== "") {
        emailInput.classList.remove("border-red-500");
        emailWarn.classList.add("hidden");
    }
});

// Função para finalizar o pedido
checkoutBtn.addEventListener("click", function() {
    // Verifica se o carrinho está vazio
    if (cart.length === 0) return;
    
    let hasError = false;
    
    // Validação do nome
    if (nameInput.value === "") {
        nameWarn.classList.remove("hidden");
        nameInput.classList.add("border-red-500");
        hasError = true;
    }
    
    // Validação do CPF
    if (cpfInput.value === "") {
        cpfWarn.classList.remove("hidden");
        cpfInput.classList.add("border-red-500");
        hasError = true;
    }
    
    // Validação do endereço
    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        hasError = true;
    }
    
    // Validação do email
    if (emailInput.value === "") {
        emailWarn.classList.remove("hidden");
        emailInput.classList.add("border-red-500");
        hasError = true;
    }

    // Atualiza o modal do carrinho e abre o modal de pagamento
    cartModal.style.display = "none"; // Fecha o modal do carrinho
    paymentModal.style.display = "flex"; // Abre o modal de pagamento
});

// Fecha o modal de pagamento ao clicar em "Cancelar pagamento"
cancelPaymentBtn.addEventListener("click", function() {
  paymentModal.style.display = "none";
});

// Fecha o modal de pagamento ao clicar em "Cancelar pagamento"
cancelPaymentBtn.addEventListener("click", function() {
  paymentModal.style.display = "none";
});                                         

// Processa o pagamento com Stripe
checkoutStripeBtn.addEventListener("click", async function () {
  if (cart.length === 0) return;

  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))
      })
    });

    const session = await response.json();

    if (session.id) {
      const stripe = Stripe("pk_live_51RLWZiDCgQUWVX4YKX1JwdhjHT8fJ74CXCereV5tdWRFRiwOUzYKJPVJhpouBrtZmOpAxbINCI9QqUaRIpgtCjX600zNEKPFNi"); // Substitua pela sua chave pública real
      stripe.redirectToCheckout({ sessionId: session.id });
    } else {
      throw new Error("Falha ao obter a sessão do Stripe.");
    }

  } catch (error) {
    console.error("Erro no pagamento Stripe:", error);
    alert("Ocorreu um erro ao tentar processar o pagamento.");
  }
});