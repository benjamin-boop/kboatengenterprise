(function () {
    const catalog = Array.isArray(window.KBProductCatalog)
        ? window.KBProductCatalog
        : [];
    const catalogById = new Map(catalog.map(product => [String(product.id), product]));
    const helpPages = [
        {
            title: "Browse all products",
            category: "Store",
            url: "shop.html",
            description: "Explore shower gels, fabric softeners and deodorant sprays.",
            keywords: "shop products catalogue catalog browse collection"
        },
        {
            title: "Place an order",
            category: "Orders",
            url: "cart.html",
            description: "Add items to your cart and contact the team to confirm an order.",
            keywords: "order ordering buy purchase checkout cart whatsapp"
        },
        {
            title: "Delivery information",
            category: "Delivery",
            url: "cart.html",
            description: "Free delivery in Accra on website orders above GH₵720. Other delivery fees are confirmed after delivery.",
            keywords: "delivery shipping fee fees accra ghana free"
        },
        {
            title: "Contact our team",
            category: "Support",
            url: "contact.html",
            description: "Get in touch by phone or email for product and order support.",
            keywords: "contact support phone email call help customer service"
        },
        {
            title: "About K.Boateng Enterprise",
            category: "About",
            url: "about.html",
            description: "Learn about our household and personal care products in Ghana.",
            keywords: "about company business accra ghana household personal care"
        },
        {
            title: "Care tips and company news",
            category: "Journal",
            url: "blog.html",
            description: "Read skincare and laundry tips, product stories and company updates.",
            keywords: "blog journal news articles aloe laundry tips advice"
        }
    ];

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
    }

    function addCurrentPageProducts() {
        document.querySelectorAll(".product[data-id][data-name]").forEach(card => {
            const id = String(card.dataset.id);
            const pageName = normalize(card.dataset.name);
            const registered = catalogById.get(id) || catalog.find(product => {
                const catalogName = normalize(product.name);
                return catalogName === pageName ||
                    catalogName.startsWith(pageName) ||
                    pageName.startsWith(catalogName);
            });
            card.id = card.id || `product-${id}`;

            if (registered) return;

            const image = card.dataset.image || card.querySelector("img")?.getAttribute("src") || "";
            const name = card.dataset.name;
            const brand = card.querySelector(".des span")?.textContent.trim() || "";
            const url = card.querySelector("img")?.getAttribute("onclick")?.match(/href=['"]([^'"]*)['"]/)?.[1];
            const product = {
                id,
                name,
                brand,
                category: "Store product",
                image,
                url: url || `shop.html?product=${encodeURIComponent(id)}#product-${encodeURIComponent(id)}`,
                description: `${name}${brand ? ` by ${brand}` : ""}. Contact us for current product information.`
            };
            catalogById.set(id, product);
            catalog.push(product);
        });
    }

    addCurrentPageProducts();

    const productTerms = product => normalize([
        product.name,
        product.brand,
        product.category,
        product.description,
        product.keywords
    ].join(" "));

    const helpTerms = page => normalize([
        page.title,
        page.category,
        page.description,
        page.keywords
    ].join(" "));

    function scoreMatch(query, searchable, title) {
        const tokens = query.split(/\s+/).filter(Boolean);
        if (!tokens.length) return 1;
        if (!tokens.every(token => searchable.includes(token))) return 0;

        let score = 10;
        if (searchable.includes(query)) score += 12;

        const normalizedTitle = normalize(title);
        if (normalizedTitle === query) score += 20;
        else if (normalizedTitle.startsWith(query)) score += 10;

        tokens.forEach(token => {
            if (normalizedTitle.includes(token)) score += 4;
        });

        return score;
    }

    const backdrop = document.createElement("div");
    backdrop.className = "search-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.innerHTML = `
        <section class="search-dialog" role="dialog" aria-modal="true" aria-label="Search products and information">
            <form class="search-dialog-head" role="search">
                <span class="search-glass" aria-hidden="true"></span>
                <input class="search-dialog-input" type="search" autocomplete="off" placeholder="Search products, care tips, delivery..." aria-label="Search products and website information">
                <button class="search-dialog-close" type="button" aria-label="Close search">×</button>
            </form>
            <div class="search-dialog-content">
                <p class="search-hint" aria-live="polite"></p>
                <div class="search-results"></div>
            </div>
            <div class="search-dialog-footer">Search products, product types, brands, care tips and store information.</div>
        </section>`;
    document.body.appendChild(backdrop);

    const form = backdrop.querySelector(".search-dialog-head");
    const input = backdrop.querySelector(".search-dialog-input");
    const resultArea = backdrop.querySelector(".search-results");
    const hint = backdrop.querySelector(".search-hint");
    const closeButton = backdrop.querySelector(".search-dialog-close");
    let returnFocusTo = null;

    function createResult(item, image) {
        const link = document.createElement("a");
        link.className = "search-result";
        link.href = item.url || `shop.html?product=${encodeURIComponent(item.id || "")}#product-${encodeURIComponent(item.id || "")}`;

        if (image) {
            const imageFrame = document.createElement("span");
            imageFrame.className = "search-result-image";
            const img = document.createElement("img");
            img.src = image;
            img.alt = "";
            img.loading = "lazy";
            imageFrame.appendChild(img);
            link.appendChild(imageFrame);
        } else {
            const icon = document.createElement("span");
            icon.className = "search-result-image search-result-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "↗";
            link.appendChild(icon);
        }

        const copy = document.createElement("span");
        copy.className = "search-result-copy";

        const title = document.createElement("span");
        title.className = "search-result-name";
        title.textContent = item.name || item.title;

        const meta = document.createElement("span");
        meta.className = "search-result-meta";
        meta.textContent = [item.brand, item.category].filter(Boolean).join(" · ") || item.category;

        const description = document.createElement("span");
        description.className = "search-result-description";
        description.textContent = item.description;

        copy.append(title, meta, description);
        link.appendChild(copy);

        const arrow = document.createElement("span");
        arrow.className = "search-result-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        link.appendChild(arrow);

        return link;
    }

    function appendGroup(label, items, isProductGroup) {
        if (!items.length) return;

        const heading = document.createElement("p");
        heading.className = "search-results-label";
        heading.textContent = label;
        resultArea.appendChild(heading);

        items.forEach(item => {
            resultArea.appendChild(createResult(item, isProductGroup ? item.image : ""));
        });
    }

    function renderResults(value) {
        const query = normalize(value);
        const productMatches = catalog
            .map(product => ({
                product,
                score: scoreMatch(query, productTerms(product), product.name)
            }))
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .filter((result, index, matches) =>
                matches.findIndex(candidate =>
                    normalize(candidate.product.name) === normalize(result.product.name)
                ) === index
            )
            .slice(0, 6);
        const matchedProducts = productMatches.map(result => result.product);

        const matchedPages = helpPages
            .map(page => ({
                page,
                score: scoreMatch(query, helpTerms(page), page.title)
            }))
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(result => result.page);

        resultArea.replaceChildren();

        if (!query) {
            hint.textContent = "Popular products and helpful pages";
            appendGroup("Popular products", catalog.slice(0, 4), true);
            appendGroup("Explore", helpPages.slice(0, 3), false);
            return;
        }

        const resultCount = matchedProducts.length + matchedPages.length;
        hint.textContent = resultCount
            ? `${resultCount} ${resultCount === 1 ? "result" : "results"} for “${value.trim()}”`
            : `No results for “${value.trim()}”`;

        appendGroup("Products", matchedProducts, true);
        appendGroup("Helpful pages", matchedPages, false);

        if (!resultCount) {
            const empty = document.createElement("div");
            empty.className = "search-empty";

            const title = document.createElement("strong");
            title.textContent = "No matching products or pages yet.";
            const message = document.createElement("span");
            message.textContent = "Try another name, product type or ask our team for help.";

            empty.append(title, message);
            resultArea.appendChild(empty);
            resultArea.appendChild(createResult({
                title: "Contact our team",
                category: "Support",
                url: "contact.html",
                description: "We can help you find the right product."
            }, ""));
        }
    }

    function openSearch(query, trigger) {
        returnFocusTo = trigger || document.activeElement;
        backdrop.classList.add("is-open");
        backdrop.setAttribute("aria-hidden", "false");
        document.body.classList.add("search-open");
        input.value = query || "";
        renderResults(input.value);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }

    function closeSearch() {
        backdrop.classList.remove("is-open");
        backdrop.setAttribute("aria-hidden", "true");
        document.body.classList.remove("search-open");
        if (returnFocusTo && typeof returnFocusTo.focus === "function") {
            returnFocusTo.focus();
        }
    }

    function makeTrigger(isMobile) {
        const item = document.createElement("li");
        item.className = "nav-search-item";
        const button = document.createElement("button");
        button.className = "nav-search-trigger";
        button.type = "button";
        button.setAttribute("aria-label", "Search products and information");
        button.innerHTML = `<span class="search-glass" aria-hidden="true"></span><span class="nav-search-label">Search</span>${isMobile ? "" : '<span class="nav-search-shortcut">Ctrl K</span>'}`;
        button.addEventListener("click", () => openSearch("", button));
        item.appendChild(button);
        return item;
    }

    const navbar = document.getElementById("navbar");
    if (navbar) {
        const cartItem = navbar.querySelector("#lg-bag");
        navbar.insertBefore(makeTrigger(false), cartItem || navbar.firstChild);
    }

    const mobile = document.getElementById("mobile");
    if (mobile) {
        const menuButton = mobile.querySelector("#bar");
        mobile.insertBefore(makeTrigger(true), menuButton || null);
    }

    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            const firstResult = resultArea.querySelector(".search-result");
            if (firstResult) firstResult.click();
        }
    });

    form.addEventListener("submit", event => event.preventDefault());
    closeButton.addEventListener("click", closeSearch);
    backdrop.addEventListener("click", event => {
        if (event.target === backdrop) closeSearch();
    });

    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            openSearch("", document.activeElement);
        } else if (event.key === "Escape" && backdrop.classList.contains("is-open")) {
            closeSearch();
        }
    });

    const existingInput = document.getElementById("search-bar");
    if (existingInput) {
        existingInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                openSearch(existingInput.value, existingInput);
            }
        });
    }

    const requestedProduct = new URLSearchParams(window.location.search).get("product");
    if (requestedProduct) {
        const target = Array.from(document.querySelectorAll(".product[data-id]"))
            .find(product => product.dataset.id === requestedProduct);
        if (target) {
            target.classList.add("is-search-match");
            window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
        }
    }

    window.KBProductSearch = {
        open: query => openSearch(query, document.activeElement),
        close: closeSearch,
        products: catalog
    };
})();
