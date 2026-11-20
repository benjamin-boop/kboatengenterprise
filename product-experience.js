(function () {
    const catalog = Array.isArray(window.KBProductCatalog)
        ? window.KBProductCatalog
        : [];
    const productIds = new Set(catalog.map(product => product.id));
    const submittedReviews = Array.isArray(window.KBApprovedProductReviews)
        ? window.KBApprovedProductReviews
        : [];
    const approvedReviews = submittedReviews.filter((review, index) => {
        const valid = review &&
            productIds.has(review.productId) &&
            typeof review.displayName === "string" &&
            review.displayName.trim().length > 0 &&
            review.displayName.length <= 80 &&
            Number.isInteger(review.rating) &&
            review.rating >= 1 &&
            review.rating <= 5 &&
            typeof review.comment === "string" &&
            review.comment.trim().length > 0 &&
            review.comment.length <= 1000 &&
            typeof review.verifiedPurchase === "boolean";

        if (!valid) {
            console.error(`Approved product review #${index + 1} has invalid or incomplete data.`);
        }
        return valid;
    });
    const formatPrice = price => `GH₵${Number(price).toFixed(2)}`;
    const reviewsFor = productId => approvedReviews.filter(review => review.productId === productId);
    const averageFor = reviews => reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const summaryFor = productId => {
        const reviews = reviewsFor(productId);
        if (!reviews.length) {
            return { count: 0, average: 0, label: "No published reviews" };
        }

        const average = averageFor(reviews);
        return {
            count: reviews.length,
            average,
            label: `${average.toFixed(1)} ★ · ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`
        };
    };

    window.KBGetProductReviewSummary = summaryFor;

    document.querySelectorAll(".product[data-id]").forEach(card => {
        const description = card.querySelector(".des");
        if (!description) return;

        const summary = description.querySelector(".star") || document.createElement("span");
        summary.className = "review-summary";
        const reviewSummary = summaryFor(card.dataset.id);
        summary.textContent = reviewSummary.label;
        summary.classList.toggle("has-reviews", reviewSummary.count > 0);
        summary.setAttribute("aria-label", reviewSummary.count
            ? `${reviewSummary.average.toFixed(1)} out of 5 based on ${reviewSummary.count} published ${reviewSummary.count === 1 ? "review" : "reviews"}`
            : "No published reviews yet");
        if (!summary.isConnected) description.appendChild(summary);
    });

    const detail = document.getElementById("prodetails");
    const mainProduct = detail && detail.querySelector(".single-pro-img.product");
    if (mainProduct) {
        const product = catalog.find(item => item.id === mainProduct.dataset.id);
        if (product) {
            const section = document.createElement("section");
            section.className = "product-reviews section-p1";
            section.setAttribute("aria-labelledby", "product-reviews-title");

            const heading = document.createElement("div");
            heading.className = "reviews-heading";
            const title = document.createElement("h2");
            title.id = "product-reviews-title";
            title.textContent = "Customer reviews";
            const intro = document.createElement("p");
            const productReviews = reviewsFor(product.id);
            const reviewList = document.createElement("div");
            reviewList.className = "published-review-list";

            if (productReviews.length) {
                const average = averageFor(productReviews);
                intro.className = "published-review-summary";
                intro.textContent = `${average.toFixed(1)} out of 5 from ${productReviews.length} published ${productReviews.length === 1 ? "review" : "reviews"}.`;

                productReviews.forEach(review => {
                    const reviewCard = document.createElement("article");
                    reviewCard.className = "published-review";
                    const reviewHeader = document.createElement("div");
                    reviewHeader.className = "published-review-header";
                    const reviewer = document.createElement("strong");
                    reviewer.textContent = review.displayName.trim();
                    const stars = document.createElement("span");
                    stars.className = "published-review-stars";
                    stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;
                    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
                    reviewHeader.append(reviewer, stars);

                    if (review.verifiedPurchase) {
                        const verified = document.createElement("span");
                        verified.className = "verified-purchase";
                        verified.textContent = "Verified purchase";
                        reviewHeader.appendChild(verified);
                    }

                    const comment = document.createElement("p");
                    comment.textContent = review.comment.trim();
                    reviewCard.append(reviewHeader, comment);
                    reviewList.appendChild(reviewCard);
                });
            } else {
                intro.textContent = "No published reviews yet. Share your experience and our team will review it before anything appears here.";
            }
            heading.append(title, intro);

            const form = document.createElement("form");
            form.className = "review-form";

            const nameLabel = document.createElement("label");
            nameLabel.textContent = "Your name";
            const nameInput = document.createElement("input");
            nameInput.name = "reviewer";
            nameInput.type = "text";
            nameInput.autocomplete = "name";
            nameInput.maxLength = 80;
            nameInput.required = true;
            nameLabel.appendChild(nameInput);

            const ratingField = document.createElement("fieldset");
            ratingField.className = "review-rating";
            const ratingLegend = document.createElement("legend");
            ratingLegend.textContent = "Your rating";
            ratingField.appendChild(ratingLegend);
            for (let rating = 1; rating <= 5; rating += 1) {
                const label = document.createElement("label");
                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "rating";
                radio.value = String(rating);
                radio.required = true;
                const stars = document.createElement("span");
                stars.textContent = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
                label.append(radio, stars);
                ratingField.appendChild(label);
            }

            const referenceLabel = document.createElement("label");
            referenceLabel.textContent = "Order reference (optional; helps us verify your purchase)";
            const referenceInput = document.createElement("input");
            referenceInput.name = "order-reference";
            referenceInput.type = "text";
            referenceInput.maxLength = 80;
            referenceLabel.appendChild(referenceInput);

            const commentLabel = document.createElement("label");
            commentLabel.textContent = "Your feedback";
            const commentInput = document.createElement("textarea");
            commentInput.name = "comment";
            commentInput.rows = 5;
            commentInput.minLength = 8;
            commentInput.maxLength = 1000;
            commentInput.required = true;
            commentInput.placeholder = "Tell us about your experience with this product.";
            commentLabel.appendChild(commentInput);

            const note = document.createElement("p");
            note.className = "review-privacy-note";
            note.textContent = "This form prepares a message for our WhatsApp team. Reviews are not stored or published automatically; approved feedback is added to the site by our team.";

            const submit = document.createElement("button");
            submit.type = "submit";
            submit.className = "review-submit";
            submit.textContent = "Prepare review for WhatsApp";

            const shareLink = document.createElement("a");
            shareLink.className = "review-share-link";
            shareLink.target = "_blank";
            shareLink.rel = "noopener noreferrer";
            shareLink.hidden = true;

            const status = document.createElement("p");
            status.className = "review-status";
            status.setAttribute("aria-live", "polite");

            form.append(nameLabel, ratingField, referenceLabel, commentLabel, note, submit, status, shareLink);
            section.append(heading, reviewList, form);
            detail.insertAdjacentElement("afterend", section);

            form.addEventListener("submit", event => {
                event.preventDefault();
                if (!form.reportValidity()) return;

                const values = new FormData(form);
                const rating = Number(values.get("rating"));
                const message = [
                    "Product feedback for K.Boateng Enterprise",
                    `Product: ${product.name}`,
                    `Name: ${String(values.get("reviewer")).trim()}`,
                    `Rating: ${rating}/5`,
                    `Order reference: ${String(values.get("order-reference")).trim() || "Not provided"}`,
                    `Feedback: ${String(values.get("comment")).trim()}`
                ].join("\n");

                shareLink.href = `https://wa.me/233538356979?text=${encodeURIComponent(message)}`;
                shareLink.textContent = "Continue to WhatsApp to send your review";
                shareLink.hidden = false;
                status.textContent = "Your message is ready. It will only be submitted if you continue in WhatsApp.";
            });
        }
    }

    const shopGrid = document.querySelector("#product1 .pro-container");
    if (!shopGrid || !/shop\.html$/i.test(window.location.pathname)) return;

    const selected = [];
    const panel = document.createElement("section");
    panel.className = "compare-panel";
    panel.hidden = true;
    panel.setAttribute("aria-labelledby", "compare-title");
    const panelTitle = document.createElement("h2");
    panelTitle.id = "compare-title";
    panelTitle.textContent = "Product comparison";
    const panelNote = document.createElement("p");
    panelNote.textContent = "A side-by-side look at details listed in our catalog.";
    const tableWrap = document.createElement("div");
    tableWrap.className = "compare-table-wrap";
    panel.append(panelTitle, panelNote, tableWrap);
    shopGrid.parentElement.insertBefore(panel, shopGrid);

    const dock = document.createElement("div");
    dock.className = "compare-dock";
    dock.hidden = true;
    dock.setAttribute("aria-live", "polite");
    const dockMessage = document.createElement("span");
    const compareButton = document.createElement("button");
    compareButton.type = "button";
    compareButton.textContent = "Compare selected";
    compareButton.disabled = true;
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "compare-clear";
    clearButton.textContent = "Clear";
    dock.append(dockMessage, compareButton, clearButton);
    document.body.appendChild(dock);

    function renderComparison() {
        const table = document.createElement("table");
        table.className = "compare-table";
        const head = document.createElement("thead");
        const headRow = document.createElement("tr");
        const firstHeading = document.createElement("th");
        firstHeading.scope = "col";
        firstHeading.textContent = "Product";
        headRow.appendChild(firstHeading);

        selected.forEach(product => {
            const heading = document.createElement("th");
            heading.scope = "col";
            const link = document.createElement("a");
            link.href = product.url;
            link.textContent = product.name;
            heading.appendChild(link);
            headRow.appendChild(heading);
        });
        head.appendChild(headRow);
        table.appendChild(head);

        const body = document.createElement("tbody");
        const rows = [
            ["Category", product => product.category],
            ["Brand", product => product.brand],
            ["Variant", product => product.variant],
            ["Size", product => product.size],
            ["Audience", product => product.audience || "—"],
            ["Price", product => formatPrice(product.price)]
        ];
        rows.forEach(([label, valueFor]) => {
            const row = document.createElement("tr");
            const heading = document.createElement("th");
            heading.scope = "row";
            heading.textContent = label;
            row.appendChild(heading);
            selected.forEach(product => {
                const cell = document.createElement("td");
                cell.textContent = valueFor(product);
                row.appendChild(cell);
            });
            body.appendChild(row);
        });
        table.appendChild(body);
        tableWrap.replaceChildren(table);
        panel.hidden = selected.length < 2;
        compareButton.disabled = selected.length < 2;
        dock.hidden = selected.length === 0;
        dockMessage.textContent = `${selected.length} of 3 products selected`;

        shopGrid.querySelectorAll(".compare-toggle").forEach(button => {
            const isSelected = selected.some(product => product.id === button.dataset.id);
            button.setAttribute("aria-pressed", String(isSelected));
            button.textContent = isSelected ? "Remove from comparison" : "Compare";
            button.disabled = !isSelected && selected.length >= 3;
        });
    }

    shopGrid.querySelectorAll(".product[data-id]").forEach(card => {
        const product = catalog.find(item => item.id === card.dataset.id);
        const description = card.querySelector(".des");
        if (!product || !description) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "compare-toggle";
        button.dataset.id = product.id;
        button.textContent = "Compare";
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => {
            const selectedIndex = selected.findIndex(item => item.id === product.id);
            if (selectedIndex >= 0) {
                selected.splice(selectedIndex, 1);
            } else if (selected.length < 3) {
                selected.push(product);
            }
            renderComparison();
        });
        description.appendChild(button);
    });

    compareButton.addEventListener("click", () => {
        if (selected.length >= 2) {
            panel.hidden = false;
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
    clearButton.addEventListener("click", () => {
        selected.length = 0;
        renderComparison();
        panel.hidden = true;
    });
    renderComparison();
})();
