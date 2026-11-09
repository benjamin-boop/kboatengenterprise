const bar = document.getElementById("bar");
const close = document.getElementById("close");
const nav = document.getElementById("navbar");

function setNavigationOpen(isOpen) {
    if (!bar || !nav) return;

    nav.classList.toggle("active", isOpen);
    bar.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
}

if (bar && nav) {
    bar.addEventListener("click", () => {
        setNavigationOpen(!nav.classList.contains("active"));
    });

    document.addEventListener("click", event => {
        if (nav.classList.contains("active") &&
            !nav.contains(event.target) &&
            !bar.contains(event.target)) {
            setNavigationOpen(false);
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && nav.classList.contains("active")) {
            setNavigationOpen(false);
            bar.focus();
        }
    });
}

if (close && nav && bar) {
    close.addEventListener("click", () => {
        setNavigationOpen(false);
        bar.focus();
    });
}

function searchProduct() {
    const searchInput = document.getElementById('search-bar');
    if (!searchInput) return;

    if (window.KBProductSearch) {
        window.KBProductSearch.open(searchInput.value);
        return;
    }

    const query = searchInput.value.trim().toLowerCase();
    const match = Array.from(document.querySelectorAll('.product')).find(product =>
        (product.dataset.name || '').toLowerCase().includes(query)
    );
    if (match) match.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
   









function showToast(message) {
    let toastContainer = document.querySelector('.custom-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'custom-toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('custom-toast-show');
    });

    setTimeout(() => {
        toast.classList.remove('custom-toast-show');
        toast.classList.add('custom-toast-hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, 3000);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.length;
    const bagLinks = document.querySelectorAll('#lg-bag a[href*="cart"], #mobile a[href*="cart"]');

    bagLinks.forEach(link => {
        let countEl = link.querySelector('.count');
        if (!countEl) {
            countEl = document.createElement('span');
            countEl.className = 'count';
            countEl.style.display = 'inline-flex';
            countEl.style.alignItems = 'center';
            countEl.style.justifyContent = 'center';
            countEl.style.minWidth = '18px';
            countEl.style.height = '18px';
            countEl.style.padding = '0 6px';
            countEl.style.marginLeft = '6px';
            countEl.style.backgroundColor = '#ff4d4f';
            countEl.style.color = '#fff';
            countEl.style.fontSize = '12px';
            countEl.style.borderRadius = '999px';
            countEl.style.fontWeight = '700';
            countEl.style.position = 'static';
            link.appendChild(countEl);
        }

        const isMobile = link.closest('#mobile') !== null;
        if (isMobile) {
            link.style.position = 'relative';
            countEl.style.position = 'absolute';
            countEl.style.top = '-10px';
            countEl.style.left = '50%';
            countEl.style.transform = 'translateX(-50%)';
            countEl.style.marginLeft = '0';
        } else {
            countEl.style.position = 'static';
            countEl.style.transform = 'none';
            countEl.style.marginLeft = '6px';
        }

        countEl.textContent = count > 0 ? count : '';
        countEl.style.display = count > 0 ? 'inline-flex' : 'none';
    });
}

document.querySelectorAll('.add-to-cart-btn').forEach(button => {
   button.addEventListener('click', event => {
       const productElement = event.target.closest('.product');
       const productId = productElement.dataset.id;
       const productName = productElement.dataset.name;
       const productPrice = parseFloat(productElement.dataset.price);
       const productImage = productElement.dataset.image;

       // Retrieve cart from localStorage
       const cart = JSON.parse(localStorage.getItem('cart')) || [];

       // Check if the product already exists in the cart
       const existingProduct = cart.find(product => product.id === productId);
       if (existingProduct) {
           existingProduct.quantity += 1;
           existingProduct.subtotal = existingProduct.quantity * existingProduct.price;
       } else {
           cart.push({
               id: productId,
               name: productName,
               price: productPrice,
               image: productImage,
               quantity: 1,
               subtotal: productPrice
           });
       }

       // Save the updated cart to localStorage
       localStorage.setItem('cart', JSON.stringify(cart));
       updateCartCount();
       showToast(`${productName} added to cart!`);
   });
});

function getDeliveryDetails() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    const details = [];
    if (nameInput && nameInput.value.trim()) {
        details.push(`Name: ${nameInput.value.trim()}`);
    }
    if (emailInput && emailInput.value.trim()) {
        details.push(`Email: ${emailInput.value.trim()}`);
    }
    if (phoneInput && phoneInput.value.trim()) {
        details.push(`Phone: ${phoneInput.value.trim()}`);
    }
    if (addressInput && addressInput.value.trim()) {
        details.push(`Delivery Address: ${addressInput.value.trim()}`);
    }

    return details;
}

function buildWhatsAppOrderMessage() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart.length) {
        return null;
    }

    const lines = [
        'Hello, I would like to place an order for the following items:',
        ''
    ];

    cart.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.name} - Qty: ${item.quantity} - Price: GH₵${item.price.toFixed(2)}`);
    });

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    lines.push('');
    lines.push(`Total: GH₵${total.toFixed(2)}`);

    const deliveryDetails = getDeliveryDetails();
    if (deliveryDetails.length) {
        lines.push('');
        lines.push('Delivery Details:');
        deliveryDetails.forEach(line => lines.push(line));
    } else {
        lines.push('');
        lines.push('Delivery Details: Not provided on this page.');
    }

    return lines.join('\n');
}

function setupWhatsAppOrderForm() {
    const form = document.getElementById('order-whatsapp-form');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();

        const message = buildWhatsAppOrderMessage();
        if (!message) {
            alert('Your cart is empty. Please add items to cart before ordering.');
            return;
        }

        const phone = '233538356979';
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    });
}

setupWhatsAppOrderForm();
updateCartCount();


    document.addEventListener('DOMContentLoaded', function() {
        const toggle = document.querySelector('.product-details-toggle');
        const content = document.querySelector('.product-details-content');

        if (!toggle || !content) return;

        toggle.style.cursor = 'pointer';
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-expanded', 'false');

        const toggleDetails = function() {
            const isOpen = content.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        };

        toggle.addEventListener('click', toggleDetails);
        toggle.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleDetails();
            }
        });
    });
