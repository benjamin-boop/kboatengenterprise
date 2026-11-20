(function () {
    const catalog = Array.isArray(window.KBProductCatalog)
        ? window.KBProductCatalog
        : [];
    const searchSection = document.getElementById("search");

    if (!searchSection || !catalog.length || document.getElementById("product-finder")) {
        return;
    }

    const sets = [
        {
            name: "Shower gel rotation",
            description: "Three Instituto Español shower gel variants for your bathroom shelf.",
            productIds: ["100", "99", "3"]
        },
        {
            name: "Laundry fragrance duo",
            description: "Two Bosque Verde fabric softener variants for your laundry routine.",
            productIds: ["4", "5"]
        }
    ];

    const section = document.createElement("section");
    section.id = "product-finder";
    section.className = "section-p1";
    section.innerHTML = `
        <div class="finder-heading">
            <p class="finder-eyebrow">A helpful place to start</p>
            <h2>Find your everyday fit</h2>
            <p>Choose a product type or range to see matching items from our catalog.</p>
        </div>
        <form class="finder-form">
            <label>
                I’m shopping for
                <select name="type">
                    <option value="all">Any product</option>
                    <option value="shower-gel">Shower gel</option>
                    <option value="deodorant">Deodorant</option>
                    <option value="fabric-softener">Fabric softener</option>
                </select>
            </label>
            <label>
                Range or scent
                <select name="variant">
                    <option value="all">Any range</option>
                </select>
            </label>
            <button type="submit">Show matching products</button>
        </form>
        <p class="finder-note">Matches are based on product names, types and sizes listed in our catalog—not medical or performance advice.</p>
        <div class="finder-results" aria-live="polite" hidden></div>
        <section class="finder-sets" aria-labelledby="finder-sets-title">
            <div class="finder-sets-heading">
                <div>
                    <p class="finder-eyebrow">Curated for convenience</p>
                    <h3 id="finder-sets-title">Shop ready-made sets</h3>
                </div>
                <p>Set totals are the sum of listed item prices; no bundle discount is applied.</p>
            </div>
            <div class="finder-set-grid"></div>
            <p class="finder-feedback" aria-live="polite"></p>
        </section>
    `;

    searchSection.insertAdjacentElement("afterend", section);

    const form = section.querySelector(".finder-form");
    const typeSelect = form.elements.type;
    const variantSelect = form.elements.variant;
    const results = section.querySelector(".finder-results");
    const setGrid = section.querySelector(".finder-set-grid");
    const feedback = section.querySelector(".finder-feedback");

    function formatPrice(price) {
        return `GH₵${Number(price).toFixed(2)}`;
    }

    function getProduct(id) {
        return catalog.find(product => product.id === id);
    }

    function updateVariantOptions() {
        const selectedType = typeSelect.value;
        const previousValue = variantSelect.value;
        const variants = Array.from(new Set(catalog
            .filter(product => selectedType === "all" || product.type === selectedType)
            .map(product => product.variant)
            .filter(Boolean)));

        variantSelect.replaceChildren(new Option("Any range", "all"));
        variants.forEach(variant => variantSelect.add(new Option(variant, variant)));
        if (variants.includes(previousValue)) {
            variantSelect.value = previousValue;
        }
    }

    function createProductCard(product) {
        const card = document.createElement("article");
        card.className = "finder-product";

        const imageLink = document.createElement("a");
        imageLink.className = "finder-product-image";
        imageLink.href = product.url;
        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";
        imageLink.appendChild(image);

        const copy = document.createElement("div");
        copy.className = "finder-product-copy";
        const meta = document.createElement("span");
        meta.textContent = `${product.brand} · ${product.size}`;
        if (typeof window.KBGetProductReviewSummary === "function") {
            const reviewSummary = window.KBGetProductReviewSummary(product.id);
            const reviewLabel = document.createElement("span");
            reviewLabel.className = `review-summary${reviewSummary.count ? " has-reviews" : ""}`;
            reviewLabel.textContent = reviewSummary.label;
            copy.appendChild(reviewLabel);
        }
        const titleLink = document.createElement("a");
        titleLink.className = "finder-product-title";
        titleLink.href = product.url;
        titleLink.textContent = product.name;
        const description = document.createElement("p");
        description.textContent = product.description;
        const price = document.createElement("strong");
        price.className = "finder-product-price";
        price.textContent = formatPrice(product.price);
        copy.append(meta, titleLink, description, price);

        const addButton = document.createElement("button");
        addButton.className = "finder-add-button";
        addButton.type = "button";
        addButton.textContent = "Add to cart";
        addButton.addEventListener("click", () => addProductsToCart([product]));

        card.append(imageLink, copy, addButton);
        return card;
    }

    function renderResults() {
        const selectedType = typeSelect.value;
        const selectedVariant = variantSelect.value;
        const matches = catalog.filter(product =>
            (selectedType === "all" || product.type === selectedType) &&
            (selectedVariant === "all" || product.variant === selectedVariant)
        );

        results.replaceChildren();
        results.hidden = false;

        const heading = document.createElement("h3");
        heading.textContent = matches.length
            ? `${matches.length} ${matches.length === 1 ? "match" : "matches"} for you`
            : "No exact matches";
        results.appendChild(heading);

        if (!matches.length) {
            const message = document.createElement("p");
            message.textContent = "Try another range or choose Any product to browse the full catalog.";
            results.appendChild(message);
            return;
        }

        const grid = document.createElement("div");
        grid.className = "finder-product-grid";
        matches.forEach(product => grid.appendChild(createProductCard(product)));
        results.appendChild(grid);
    }

    function addProductsToCart(products) {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");

        products.forEach(product => {
            const existing = cart.find(item =>
                item.id === product.id ||
                item.name.toLowerCase() === product.name.toLowerCase()
            );

            if (existing) {
                existing.quantity += 1;
                existing.subtotal = existing.quantity * existing.price;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image,
                    quantity: 1,
                    subtotal: Number(product.price)
                });
            }
        });

        localStorage.setItem("cart", JSON.stringify(cart));
        if (typeof window.updateCartCount === "function") {
            window.updateCartCount();
        }
        if (typeof window.showToast === "function") {
            window.showToast(products.length === 1
                ? `${products[0].name} added to cart!`
                : `${products.length} items added to cart!`);
        }
        feedback.textContent = products.length === 1
            ? `${products[0].name} added to your cart.`
            : `${products.length} set items added to your cart.`;
    }

    function createSetCard(set) {
        const products = set.productIds.map(getProduct);
        if (products.some(product => !product)) {
            console.error(`The "${set.name}" set references a product missing from the catalog.`);
            return null;
        }

        const card = document.createElement("article");
        card.className = "finder-set-card";
        const title = document.createElement("h4");
        title.textContent = set.name;
        const description = document.createElement("p");
        description.textContent = set.description;
        const list = document.createElement("ul");
        products.forEach(product => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = product.url;
            link.textContent = product.name;
            const price = document.createElement("span");
            price.textContent = formatPrice(product.price);
            item.append(link, price);
            list.appendChild(item);
        });

        const total = products.reduce((sum, product) => sum + Number(product.price), 0);
        const totalLine = document.createElement("strong");
        totalLine.className = "finder-set-total";
        totalLine.textContent = `Set total: ${formatPrice(total)}`;

        const addButton = document.createElement("button");
        addButton.className = "finder-add-button";
        addButton.type = "button";
        addButton.textContent = "Add set to cart";
        addButton.addEventListener("click", () => addProductsToCart(products));

        card.append(title, description, list, totalLine, addButton);
        return card;
    }

    catalog.forEach(product => {
        if (!Number.isFinite(Number(product.price)) || !product.type || !product.variant || !product.size) {
            console.error(`Product "${product.name}" is missing price or finder data.`);
        }
    });

    sets.forEach(set => {
        const card = createSetCard(set);
        if (card) setGrid.appendChild(card);
    });

    typeSelect.addEventListener("change", updateVariantOptions);
    form.addEventListener("submit", event => {
        event.preventDefault();
        renderResults();
    });
    updateVariantOptions();
})();
