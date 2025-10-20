// Sample product data
let products = [
    {
        id: 1,
        name: "Arduino Starter Kit",
        price: 15000,
        category: "DIY Modules",
        description: "Complete kit for beginners to learn electronics"
    },
    {
        id: 2,
        name: "Resistor Assortment Pack",
        price: 3500,
        category: "Components",
        description: "1000 resistors in various values"
    },
    {
        id: 3,
        name: "Soldering Iron Kit",
        price: 8500,
        category: "Consumables",
        description: "60W soldering iron with accessories"
    },
    {
        id: 4,
        name: "Raspberry Pi 4",
        price: 45000,
        category: "DIY Modules",
        description: "4GB RAM model with case and accessories"
    },
    {
        id: 5,
        name: "Capacitor Kit",
        price: 5000,
        category: "Components",
        description: "Assorted ceramic and electrolytic capacitors"
    },
    {
        id: 6,
        name: "Multimeter",
        price: 12000,
        category: "Consumables",
        description: "Digital multimeter with auto-ranging"
    }
];

// Cart functionality
let cart = [];
let currentEditId = null;
let isAdminAuthenticated = false;

// DOM Elements
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.querySelector('.cart-count');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const productsGrid = document.getElementById('productsGrid');
const adminPanel = document.getElementById('adminPanel');
const toggleAdminBtn = document.getElementById('toggleAdminBtn');
const adminForm = document.getElementById('adminForm');
const addProductBtn = document.getElementById('addProductBtn');
const updateProductBtn = document.getElementById('updateProductBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Set your admin password here (CHANGE THIS TO YOUR OWN PASSWORD!)
const ADMIN_PASSWORD = "geadmin123";

// Calculate total from cart - SINGLE SOURCE OF TRUTH
function calculateCartTotal() {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// Format currency consistently
function formatCurrency(amount) {
    return amount.toFixed(2);
}

// Initialize the page
function init() {
    renderProducts();
    updateCartCount();
    
    // Hide admin toggle button initially
    toggleAdminBtn.style.display = 'none';
    
    // Event listeners
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });
    
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });
    
    checkoutBtn.addEventListener('click', checkout);
    
    // Add double-click event to hero section for admin access
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('dblclick', showAdminAuthPrompt);
    
    // Alternative: Add keyboard shortcut (Ctrl+Shift+A)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            showAdminAuthPrompt();
        }
    });
    
    addProductBtn.addEventListener('click', addProduct);
    updateProductBtn.addEventListener('click', updateProduct);
    cancelEditBtn.addEventListener('click', cancelEdit);
}

// Show admin authentication prompt
function showAdminAuthPrompt() {
    const password = prompt("Enter admin password to access admin panel:");
    if (password === ADMIN_PASSWORD) {
        isAdminAuthenticated = true;
        toggleAdminBtn.style.display = 'inline-block';
        alert("Admin access granted! You can now toggle the admin panel.");
    } else if (password !== null) {
        alert("Incorrect password!");
    }
}

// Render products to the grid
function renderProducts() {
    productsGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-microchip"></i>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">MWK ${formatCurrency(product.price)}</div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-plus"></i> Add to Cart
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
        
        // Add event listener to the add to cart button
        const addToCartBtn = productCard.querySelector('.add-to-cart');
        addToCartBtn.addEventListener('click', () => addToCart(product.id));
    });
}

// Add to cart function
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCartCount();
    renderCart();
}

// Update cart count display
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

// Render cart items
function renderCart() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = 'MWK 0.00';
        return;
    }
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <i class="fas fa-microchip"></i>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">MWK ${formatCurrency(item.price)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="quantity-btn remove" data-id="${item.id}" style="margin-left: 10px; background: var(--danger); color: white;">Remove</button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
        
        // Add event listeners for quantity buttons
        const minusBtn = cartItem.querySelector('.minus');
        const plusBtn = cartItem.querySelector('.plus');
        const removeBtn = cartItem.querySelector('.remove');
        
        minusBtn.addEventListener('click', () => updateQuantity(item.id, -1));
        plusBtn.addEventListener('click', () => updateQuantity(item.id, 1));
        removeBtn.addEventListener('click', () => removeFromCart(item.id));
    });
    
    // Use the same calculation method for display
    const displayTotal = calculateCartTotal();
    cartTotal.textContent = `MWK ${formatCurrency(displayTotal)}`;
}

// Update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    // Remove item if quantity is 0 or less
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    updateCartCount();
    renderCart();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCart();
}

// Fixed checkout function with accurate total calculation
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Use the same calculation method as the cart display
    const total = calculateCartTotal();
    
    let message = 'Hello GE Engineering! 🛍️\n\nI would like to purchase the following items:\n\n';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `- ${item.name} (x${item.quantity}) - MWK ${formatCurrency(itemTotal)}\n`;
    });
    
    message += `\n📦 TOTAL: MWK ${formatCurrency(total)}\n\nPlease confirm availability and send product images. Thank you!`;
    
    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the message
    window.open(`https://wa.me/265885890781?text=${encodedMessage}`, '_blank');
    
    // Clear cart after checkout
    cart = [];
    updateCartCount();
    renderCart();
    cartSidebar.classList.remove('open');
}

// Admin functions
function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value;
    
    if (!name || !price || !category || !description) {
        alert('Please fill all fields');
        return;
    }
    
    // Generate new ID
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    products.push({
        id: newId,
        name,
        price,
        category,
        description
    });
    
    renderProducts();
    adminForm.reset();
    alert('Product added successfully!');
}

function updateProduct() {
    if (currentEditId === null) return;
    
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value;
    
    if (!name || !price || !category || !description) {
        alert('Please fill all fields');
        return;
    }
    
    const productIndex = products.findIndex(p => p.id === currentEditId);
    if (productIndex !== -1) {
        products[productIndex] = {
            id: currentEditId,
            name,
            price,
            category,
            description
        };
        
        renderProducts();
        adminForm.reset();
        currentEditId = null;
        updateProductBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
        addProductBtn.style.display = 'block';
        alert('Product updated successfully!');
    }
}

function cancelEdit() {
    currentEditId = null;
    adminForm.reset();
    updateProductBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
    addProductBtn.style.display = 'block';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);