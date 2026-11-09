// Script for navigation bar
const bar = document.getElementById("bar");
const close = document.getElementById("close");
const nav = document.getElementById("navbar");

if (bar) {
    bar.addEventListener("click", () => {
        nav.classList.add("active");
    })
}

if (close) {
    close.addEventListener("click", () => {
        nav.classList.remove("active");
    })
}



// Cart Js path.....

const cartTableBody = document.getElementById('cart-items');
const totalElement = document.getElementById('total');

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to update the total
function updateTotal() {
    const total = cart.reduce((sum, product) => sum + product.subtotal, 0);
    totalElement.textContent = total.toFixed(2);
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
            link.appendChild(countEl);
        }

        const isMobile = link.closest('#mobile') !== null;

        if (isMobile) {
            // Position above the icon for mobile
            link.style.position = 'relative';
            link.style.display = 'inline-block';
            countEl.style.position = 'absolute';
            countEl.style.top = '-10px';
            countEl.style.left = '50%';
            countEl.style.transform = 'translateX(-50%)';
            countEl.style.display = 'inline-flex';
            countEl.style.alignItems = 'center';
            countEl.style.justifyContent = 'center';
            countEl.style.minWidth = '18px';
            countEl.style.height = '18px';
            countEl.style.padding = '0 6px';
            countEl.style.backgroundColor = '#ff4d4f';
            countEl.style.color = '#fff';
            countEl.style.fontSize = '12px';
            countEl.style.borderRadius = '999px';
            countEl.style.fontWeight = '700';
            countEl.style.zIndex = '1';
        } else {
            // Position to the right for desktop
            countEl.style.position = 'static';
            countEl.style.transform = 'none';
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
        }

        countEl.textContent = count > 0 ? count : '';
        countEl.style.display = count > 0 ? (isMobile ? 'inline-flex' : 'inline-flex') : 'none';
    });
}

function updateCartDisplay() {
    updateCartCount();
}

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
        lines.push('Delivery Details: Not provided.');
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

// Function to update the cart table
function updateCartTable() {
    cartTableBody.innerHTML = ''; // Clear existing rows
    cart.forEach(product => {
        const row = document.createElement('tr');

        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.width = 50;
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        row.appendChild(nameCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = '$' + product.price.toFixed(2);
        row.appendChild(priceCell);

        const quantityCell = document.createElement('td');
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = product.quantity;
        quantityInput.min = 1;
        quantityInput.dataset.id = product.id;
        quantityInput.className = 'quantity-input';
        quantityCell.appendChild(quantityInput);
        row.appendChild(quantityCell);

        const subtotalCell = document.createElement('td');
        subtotalCell.textContent = '$' + product.subtotal.toFixed(2);
        row.appendChild(subtotalCell);

        const removeCell = document.createElement('td');
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✖';
        removeBtn.className = 'remove-btn';
        removeBtn.dataset.id = product.id;
        removeCell.appendChild(removeBtn);
        row.appendChild(removeCell);

        cartTableBody.appendChild(row);
    });

    // Add event listeners for quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', event => {
            const productId = event.target.dataset.id;
            const newQuantity = parseInt(event.target.value);

            // Update product in the cart
            const product = cart.find(product => product.id === productId);
            product.quantity = newQuantity;
            product.subtotal = product.price * newQuantity;

            // Save and refresh
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartTable();
            updateTotal();
        });
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', event => {
            const productId = event.target.dataset.id;

            // Remove product from the cart
            cart = cart.filter(product => product.id !== productId);

            // Save and refresh
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartTable();
            updateTotal();
        });
    });

    updateCartCount();
}

// Initial render
updateCartTable();
updateTotal();





// Paystack Path.....


// Mock user email from login/signup
const userEmail = localStorage.getItem("userEmail") || "customer@example.com";

// Paystack Checkout
const paystackPublicKey = "pk_live_83996015a353048d3772029286287dd44d195a24"; // Replace with your actual Paystack public key

document.getElementById("checkout-btn").addEventListener("click", function () {
    const totalAmount = parseFloat(document.getElementById("total").textContent);
    const amountInKobo = totalAmount * 100; // Paystack uses the smallest currency unit

    const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: userEmail, // Use the email from login/signup
        amount: amountInKobo,
        currency: "GHS",
        ref: "TXN_" + Math.floor(Math.random() * 1000000000 + 1), // Unique transaction reference
        callback: function (response) {
            alert("Payment successful! Transaction reference: " + response.reference);

            // Clear the cart
            cart = [];
            localStorage.removeItem("cart");
            updateCartTable();
            updateTotal();
            updateCartDisplay();

            // Redirect to success page
            window.location.href = "page.html";
        },
        onClose: function () {
            alert("Transaction was not completed, window closed.");
        }

    });

    handler.openIframe();
});






// Replace this with the desired WhatsApp number
const whatsappNumber = "233538356979";

document.getElementById("order-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const product = document.getElementById("product").value;
    const reference = document.getElementById("reference").value;
    const address = document.getElementById("address").value;

    // Construct the WhatsApp message
    const message = `
        Hello, I have placed an order:
        - Name: ${name}
        - Email: ${email}
        - Phone: ${phone}
        - Products: ${product}
        - TXN ID: ${reference}
        - Delivery Address: ${address}
    `.trim();

    // Create the WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Redirect to WhatsApp
    window.open(whatsappUrl, "_blank");
});








