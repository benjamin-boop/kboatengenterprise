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



//search area
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



//Adding items to Cart 

function showToast(message) {
    let toastContainer = document.querySelector('.custom-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'custom-toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '10px';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;
    toast.style.background = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = '#fff';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
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
            link.appendChild(countEl);
        }

        const isMobile = link.closest('#mobile') !== null;

        if (isMobile) {
            // Position above the icon for mobile
            link.style.position = 'relative';
            link.style.display = 'inline-flex';
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
        showToast(`${productName} added to the cart!`);
        updateCartCount();
    });
});

function shouldShowCookieBanner() {
    const consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null');
    if (!consent || !consent.status) {
        return true;
    }

    const age = Date.now() - consent.timestamp;
    return age >= 24 * 60 * 60 * 1000;
}

function hideCookieBanner() {
    const banner = document.getElementById('cookie-consent');
    if (!banner) return;
    banner.classList.remove('visible');
    banner.classList.add('hidden');
}

function setCookieConsent(status) {
    localStorage.setItem('cookieConsent', JSON.stringify({
        status,
        timestamp: Date.now()
    }));
    hideCookieBanner();
}

function initCookieBanner() {
    const banner = document.getElementById('cookie-consent');
    const acceptButton = document.getElementById('cookie-accept');
    const rejectButton = document.getElementById('cookie-reject');
    if (!banner || !acceptButton || !rejectButton) return;

    acceptButton.addEventListener('click', () => setCookieConsent('accepted'));
    rejectButton.addEventListener('click', () => setCookieConsent('rejected'));

    if (shouldShowCookieBanner()) {
        banner.classList.remove('hidden');
        banner.classList.add('visible');
    }
}

initCookieBanner();

updateCartCount();
