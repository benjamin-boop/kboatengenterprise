(function () {
    const business = {
        phone: "+233 599310095",
        email: "kpeegh402@gmail.com",
        hours: "Monday to Saturday, 5:00 a.m. to 9:00 p.m.",
        location: "Accra, Ghana",
        delivery: "Orders above GHS 720 qualify for free delivery within Accra. The cart page notes that delivery fees are confirmed after delivery."
    };

    const pageLinks = {
        products: { label: "Browse products", url: "shop.html" },
        about: { label: "About K.Boateng Enterprise", url: "about.html" },
        contact: { label: "Contact us", url: "contact.html" },
        delivery: { label: "Delivery and checkout", url: "cart.html" },
        blog: { label: "Read the blog", url: "blog.html" }
    };

    function createAIAssistant() {
        const container = document.createElement("div");
        container.id = "ai-assistant";
        container.innerHTML = `
            <button id="ai-toggle" type="button" aria-label="Open store assistant" aria-controls="ai-chat" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </button>
            <section id="ai-chat" aria-label="K.Boateng Enterprise store assistant" aria-hidden="true">
                <div id="ai-header">
                    <span>Store assistant <small>Products, orders &amp; help</small></span>
                    <button id="ai-close" type="button" aria-label="Close assistant">&times;</button>
                </div>
                <div id="ai-messages" aria-live="polite"></div>
                <div id="ai-suggestions" aria-label="Suggested questions">
                    <button type="button" data-question="Where are you located?">Location</button>
                    <button type="button" data-question="Tell me about your products">Products</button>
                    <button type="button" data-question="How does delivery work?">Delivery</button>
                    <button type="button" data-question="Compare two products">Compare</button>
                </div>
                <form id="ai-input-area">
                    <input type="text" id="ai-input" placeholder="Ask about products, delivery..." aria-label="Ask the store assistant" autocomplete="off">
                    <button id="ai-send" type="submit">Send</button>
                </form>
            </section>
        `;
        document.body.appendChild(container);
        return container;
    }

    function catalog() {
        return Array.isArray(window.KBProductCatalog) ? window.KBProductCatalog : [];
    }

    function productMatches(message) {
        const query = message.toLowerCase();
        return catalog().map(product => {
            const name = product.name.toLowerCase();
            const directMatch = query.includes(name);
            const keywordMatch = (product.keywords || "")
                .toLowerCase()
                .split(/\s+/)
                .filter(keyword => keyword.length >= 4 && query.includes(keyword));
            const nameMatch = name.split(/\s+/).filter(word =>
                word.length >= 4 && query.includes(word)
            );
            return {
                product,
                score: (directMatch ? 10 : 0) + nameMatch.length * 3 + keywordMatch.length
            };
        })
            .filter(match => match.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(match => match.product);
    }

    function productLink(product) {
        return { label: product.name, url: product.url };
    }

    function findCurrentProduct() {
        const pathname = window.location.pathname.toLowerCase();
        const product = catalog().find(item => {
            const productPath = new URL(item.url, document.baseURI).pathname.toLowerCase();
            return productPath === pathname;
        });
        if (product) return product;

        const productId = new URLSearchParams(window.location.search).get("product");
        return productId ? catalog().find(item => item.id === productId) : null;
    }

    function answerQuestion(message) {
        const query = message.toLowerCase();
        const products = productMatches(message);
        const currentProduct = findCurrentProduct();
        const links = [];

        if (/\b(compare|comparison|versus|vs\.?|difference|better)\b/.test(query)) {
            if (products.length >= 2) {
                const [first, second] = products;
                const comparison = [
                    `${first.name} is a ${first.category.toLowerCase()} from ${first.brand}. ${first.description}`,
                    `${second.name} is a ${second.category.toLowerCase()} from ${second.brand}. ${second.description}`
                ].join(" ");
                links.push(productLink(first), productLink(second));
                links.push({
                    label: "Search the web for more comparisons",
                    url: `https://www.google.com/search?q=${encodeURIComponent(`compare ${first.name} vs ${second.name}`)}`,
                    external: true
                });
                return {
                    text: `${comparison} Those are the details currently listed in our catalog; check with us for current prices or product ingredients.`,
                    links
                };
            }

            if (products.length === 1) {
                const product = products[0];
                const otherProduct = message.match(/\b(?:with|versus|vs\.?|against)\s+(.+)$/i);
                const compareQuery = otherProduct
                    ? `compare ${product.name} with ${otherProduct[1].trim()}`
                    : `compare ${product.name} with other products`;
                links.push(productLink(product), {
                    label: "Compare with other brands on the web",
                    url: `https://www.google.com/search?q=${encodeURIComponent(compareQuery)}`,
                    external: true
                });
                return {
                    text: `Our catalog lists ${product.name}: ${product.description} I can confirm our catalog details, but not live specifications for other brands. Use the web search link for outside options, or tell me another product listed in our shop to compare them here.`,
                    links
                };
            }

            links.push(pageLinks.products);
            return {
                text: "Which two products would you like to compare? I can compare items in our catalog, or provide a web search link for products from other brands.",
                links
            };
        }

        if (/\b(where|location|located|address|directions|map)\b/.test(query)) {
            links.push(pageLinks.contact);
            return {
                text: `K.Boateng Enterprise is based in ${business.location}. Visit our Contact page for the location map or contact us for directions.`,
                links
            };
        }

        if (/\b(hours|open|opening|close|closing|weekend|saturday|sunday)\b/.test(query)) {
            links.push(pageLinks.contact);
            return { text: `Our listed hours are ${business.hours}. For help outside these hours, leave us a message on the Contact page.`, links };
        }

        if (/\b(delivery|deliver|shipping|ship|free delivery|fee)\b/.test(query)) {
            links.push(pageLinks.delivery, pageLinks.contact);
            return { text: `${business.delivery} For a delivery quote or orders outside Accra, please contact us.`, links };
        }

        if (/\b(contact|phone|call|email|mail|whatsapp|reach)\b/.test(query)) {
            links.push(
                { label: `Call ${business.phone}`, url: `tel:${business.phone.replace(/\s/g, "")}` },
                { label: `Email ${business.email}`, url: `mailto:${business.email}` },
                pageLinks.contact
            );
            return { text: `You can reach K.Boateng Enterprise at ${business.phone} or ${business.email}.`, links };
        }

        if (/\b(about|who are you|enterprise|company|business|story)\b/.test(query)) {
            links.push(pageLinks.about);
            return {
                text: "K.Boateng Enterprise is an Accra-based retailer and wholesaler of personal-care and household products, including Instituto Español shower gels, L.E.A. deodorants, and Bosque Verde fabric softeners.",
                links
            };
        }

        if (/\b(order|orders|cart|checkout|pay|payment|buy|purchase)\b/.test(query)) {
            links.push(pageLinks.products, pageLinks.delivery, pageLinks.contact);
            return {
                text: "Browse products and add items to your cart to start an order. The cart page has checkout and delivery details; contact us if you need help with payment or an existing order.",
                links
            };
        }

        if (products.length) {
            const matches = products.slice(0, 4);
            matches.forEach(product => links.push(productLink(product)));
            return {
                text: matches.length === 1
                    ? `${matches[0].name} — ${matches[0].description} Contact us for current pricing or product-specific advice.`
                    : `Here are the catalog items that best match your question: ${matches.map(product => product.name).join(", ")}. Ask me to compare any two.`,
                links
            };
        }

        if (/\b(this page|current page|what am i looking at|what is this)\b/.test(query) && currentProduct) {
            links.push(productLink(currentProduct));
            return { text: `You’re viewing ${currentProduct.name}. ${currentProduct.description}`, links };
        }

        if (/\b(this page|current page|what am i looking at|what is this)\b/.test(query)) {
            const pathname = window.location.pathname.toLowerCase();
            const page = pathname.endsWith("/about.html")
                ? { title: "About K.Boateng Enterprise", description: "Learn about our Accra-based retail and wholesale business and its personal-care and household products.", link: pageLinks.about }
                : pathname.endsWith("/contact.html")
                    ? { title: "Contact page", description: `Find our contact details and location map. You can call ${business.phone} or email ${business.email}.`, link: pageLinks.contact }
                    : pathname.endsWith("/blog.html")
                        ? { title: "K.Boateng Enterprise blog", description: "Browse our articles and product-related stories.", link: pageLinks.blog }
                        : pathname.endsWith("/cart.html")
                            ? { title: "Your cart and checkout", description: `${business.delivery} The cart page also contains checkout options.`, link: pageLinks.delivery }
                            : pathname.endsWith("/shop.html")
                                ? { title: "Our product catalog", description: "Browse shower gels, deodorant sprays, and concentrated fabric softeners.", link: pageLinks.products }
                                : { title: "K.Boateng Enterprise home page", description: "Discover our household and personal-care collection, browse products, or learn about the enterprise.", link: pageLinks.products };
            links.push(page.link);
            return { text: `${page.title}. ${page.description}`, links };
        }

        if (/\b(product|products|shop|catalog|catalogue|available|sell|offer)\b/.test(query)) {
            links.push(pageLinks.products);
            return {
                text: "Our catalog includes shower gels, deodorant sprays, and concentrated fabric softeners. You can ask me about a product by name or ask to compare two catalog items.",
                links
            };
        }

        if (/\b(hello|hi|hey|good morning|good afternoon)\b/.test(query)) {
            links.push(pageLinks.products, pageLinks.contact);
            return { text: "Hello! I can help you find or compare our products, explain delivery, or share our contact and location details. What would you like to know?", links };
        }

        const searchTerm = currentProduct ? `${currentProduct.name} ${message}` : message;
        links.push({
            label: "Search the web for this question",
            url: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`,
            external: true
        }, pageLinks.contact);
        return {
            text: "I can answer using the information published on this site and our product catalog. For current information from outside the site, use the web search link; you can also contact our team for product or order help.",
            links
        };
    }

    function addMessage(text, isUser, links) {
        const messages = document.getElementById("ai-messages");
        const message = document.createElement("div");
        message.className = isUser ? "user-message" : "ai-message";
        message.textContent = text;

        if (links && links.length) {
            const linkList = document.createElement("div");
            linkList.className = "ai-message-links";
            links.forEach(item => {
                const link = document.createElement("a");
                link.href = item.url;
                link.textContent = item.label;
                if (item.external) {
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                }
                linkList.appendChild(link);
            });
            message.appendChild(linkList);
        }

        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function initAIAssistant() {
        createAIAssistant();

        const toggle = document.getElementById("ai-toggle");
        const chat = document.getElementById("ai-chat");
        const close = document.getElementById("ai-close");
        const input = document.getElementById("ai-input");
        const form = document.getElementById("ai-input-area");

        function setOpen(isOpen) {
            chat.classList.toggle("open", isOpen);
            chat.setAttribute("aria-hidden", String(!isOpen));
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.setAttribute("aria-label", isOpen ? "Close store assistant" : "Open store assistant");
            if (isOpen) input.focus();
        }

        function sendMessage(message) {
            const text = message.trim();
            if (!text) return;
            addMessage(text, true);
            const answer = answerQuestion(text);
            addMessage(answer.text, false, answer.links);
            input.value = "";
            input.focus();
        }

        toggle.addEventListener("click", () => setOpen(!chat.classList.contains("open")));
        close.addEventListener("click", () => {
            setOpen(false);
            toggle.focus();
        });
        form.addEventListener("submit", event => {
            event.preventDefault();
            sendMessage(input.value);
        });
        document.getElementById("ai-suggestions").addEventListener("click", event => {
            const button = event.target.closest("button[data-question]");
            if (button) sendMessage(button.dataset.question);
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && chat.classList.contains("open")) {
                setOpen(false);
                toggle.focus();
            }
        });

        addMessage("Hi! I can help with products, comparisons, delivery, orders, and business details. For outside products, I’ll provide a web search link rather than guess at live information.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAIAssistant);
    } else {
        initAIAssistant();
    }
})();
