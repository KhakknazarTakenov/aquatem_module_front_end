let dealConsumptions = [];

window.addEventListener("load", async () => {
    await checkIsUserLogined("installation_team");
    const firstName = document.cookie.split('; ').find(row => row.startsWith('name=')).replace("name=", "");
    const lastName = document.cookie.split('; ').find(row => row.startsWith('last_name=')).replace("last_name=", "");
    const deals = await (await fetch(BASE_URL + "/get_deals_with_products/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            initiator_full_name: firstName + " " + lastName
        })
    })).json();
    document.getElementById('datepicker').addEventListener('change', () => { filterDeals(deals.deals) });
    document.getElementById('deal_name').addEventListener('input', () => { filterDeals(deals.deals) });
    generateDealBlocks(deals.deals);
})

async function send(deal) {
    console.log(deal)
    if (deal.products.find(product => product.fact_amount < 0)) {
        alert("Кол-во товара не может быть отрицательным!")
        return;
    }
    const userName = document.cookie.split('; ').find(row => row.startsWith('name=')).replace("name=", "");
    const userLastName = document.cookie.split('; ').find(row => row.startsWith('last_name=')).replace("last_name=", "");
    const initiator_full_name = userName + " " + userLastName;

    const res = await (await fetch(BASE_URL + "/set_fact_amount_of_products_in_deal/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            initiator_full_name: initiator_full_name,
            deal_id: deal.id,
            products: deal.products
        })
    })).json();
    console.log(res);
}

function filterDeals(deals) {
    const selectedDate = document.getElementById('datepicker').value;
    const dealName = document.getElementById('deal_name').value.toLowerCase();

    const filteredDeals = deals.filter(deal => {
        const dealDate = formatToDateInput(deal.date_create);
        const isDateMatch = selectedDate ? dealDate === selectedDate : true;
        const isNameMatch = deal.title.toLowerCase().includes(dealName);
        return isDateMatch && isNameMatch;
    });

    generateDealBlocks(filteredDeals);
}

function generateDealBlocks(filteredDeals) {
    const dealsContainer = document.getElementById('deals_list');
    dealsContainer.innerHTML = ''; // Clear previous content

    filteredDeals.forEach(deal => {
        const dealDiv = document.createElement('div');
        dealDiv.className = 'deal';
        dealDiv.id = `deal_${deal.id}`;

        // Create the deal info section
        const dealInfoDiv = document.createElement('div');
        dealInfoDiv.className = 'deal_info';
        dealInfoDiv.innerHTML = `
            <span class="deal_name">${deal.title}</span>
            <span class="deal_date">${formatToDateInput(deal.date_create)}</span>
        `;

        // Create the products list section
        const dealProductsListDiv = document.createElement('div');
        dealProductsListDiv.className = 'deal_products_list';

        // Add the heading for the products list
        const productsListHeading = document.createElement('div');
        productsListHeading.className = 'deal_products_list__heading';
        productsListHeading.innerHTML = `
            <span class="heading_product_name">Материал</span>
            <span class="heading_product_consumption">Расход</span>
        `;

        // Append heading to the products list
        dealProductsListDiv.appendChild(productsListHeading);

        // Create the products section if there are products
        const dealProductsDiv = document.createElement('div');
        dealProductsDiv.className = 'deal_products';

        // Loop through products and create product blocks
        deal.products.forEach((product, productIndex) => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.id = `product_${productIndex + 1}`; // Unique ID for product

            productDiv.innerHTML = `
                <div class="product_name" id="product_${productIndex + 1}_name">${product.name}</div>
                <div class="product_consumption">
                    <span id="product_${productIndex + 1}_input_container"></span>шт
                </div>
            `;

            // Append the input created by createProductInput to the container
            const inputContainer = productDiv.querySelector(`#product_${productIndex + 1}_input_container`);
            inputContainer.appendChild(createProductInput(deal.id, product.id, product.fact_amount, product.given_amount));
            dealProductsDiv.appendChild(productDiv);
        });

        // Append products to the products list section
        dealProductsListDiv.appendChild(dealProductsDiv);

        // Create and append the "Send" button
        const sendButtonBlock = document.createElement('div');
        sendButtonBlock.className = 'send_btn_block';
        const sendBtn = document.createElement("button");
        sendBtn.classList = "send_btn font_size_20 white";
        sendBtn.innerText = "Отправить";
        sendBtn.addEventListener("click", async () => {
            const productInputs = dealProductsDiv.querySelectorAll('.product_consumption_input');

            productInputs.forEach(input => {
                const productId = Number(input.getAttribute('id').replace(`deal_${deal.id}_product_`, ""));
                const consumptionValue = input.value.trim();

                // Find the product in deal.products by product_id and update fact_amount
                const product = deal.products.find(p => p.id === productId);
                if (product) {
                    product.fact_amount = consumptionValue ? Number(consumptionValue) : null;
                }
            });
            await send(deal);
        });

        sendButtonBlock.appendChild(sendBtn);

        // Append the send button to the deal block
        dealDiv.appendChild(dealInfoDiv);
        dealDiv.appendChild(dealProductsListDiv);
        dealDiv.appendChild(sendButtonBlock); // Add button at the end of each deal block

        // Append deal to the main container
        dealsContainer.appendChild(dealDiv);
    });
}

function createProductInput(dealId, productId, productConsumption = null, productGivenAmount) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = `deal_${dealId}_product_${productId}_consumption`;
    input.id = `deal_${dealId}_product_${productId}`;
    input.value = productConsumption || ""; // Initial value
    input.className = 'product_consumption_input';

    input.addEventListener("input", (event) => {
        if (Number(event.target.value) < 0) {
            input.value = productConsumption;
        }
        if (Number(event.target.value) > productGivenAmount) {
            input.value = productGivenAmount;
        }
    })

    return input;
}