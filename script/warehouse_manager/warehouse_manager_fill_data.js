let selectedDealId = null;
let selectedDeal = null;
let all_deals = null;
let all_products = null;
let adding_product_name = null;
let selected_installation_team_member_id = null;

window.addEventListener("load", async () => {
    const firstName = document.cookie.split('; ').find(row => row.startsWith('name=')).replace("name=", "");
    const lastName = document.cookie.split('; ').find(row => row.startsWith('last_name=')).replace("last_name=", "");
    const data = await (await fetch(BASE_URL + "/get_info_for_warehouse_manager_fill_data_panel/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            initiator_full_name: firstName + " " + lastName
        })
    })).json();
    const products = await (await fetch(BASE_URL + "/get_products_from_db/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            initiator_full_name: firstName + " " + lastName
        })
    })).json();

    const installationTeamMembers = data.data.installation_department_memebers;

    all_products = products.data.products;
    all_deals = data.data.all_deals;
    fillDealsSelectList(all_deals);
    fillInstallationTeamMembersList(data.data.installation_department_memebers)

    document.getElementById("deal_name_filter").addEventListener("input", (event) => searchDeal(event, all_deals));
    document.getElementById("deal_name_filter").addEventListener("focus", (event) => {
        document.getElementById('deals_list_picker').classList.remove("hidden");
    })
    document.getElementById("deal_name_filter").addEventListener("blur", (event) => {
        setTimeout(() => {
            document.getElementById('deals_list_picker').classList.add("hidden");
        }, 500);
    })

    document.getElementById("installation_team_member_name").addEventListener("input", (event) => {
        searchInstallationTeamMember(event, installationTeamMembers);
    });
    document.getElementById("installation_team_member_name").addEventListener("focus", (event) => {
        document.getElementById('members_list_picker').classList.remove("hidden");
    })
    document.getElementById("installation_team_member_name").addEventListener("blur", (event) => {
        setTimeout(() => {
            document.getElementById('members_list_picker').classList.add("hidden");
        }, 500);
    })

})

function searchDeal(event, dealsList) {
    const selectElement = document.getElementById('deals_list_picker');
    selectElement.classList.remove("hidden")
    const input = event.target.value.toLowerCase();

    // Filter deals by title if input is not empty, otherwise use the full list
    const filteredDeals = input
        ? dealsList.filter(deal => deal.title.toLowerCase().includes(input))
        : dealsList;

    // Refill the list with filtered deals
    if (filteredDeals.length <= 0) {
        selectElement.classList.add("hidden");
        return;
    }
    fillDealsSelectList(filteredDeals);
}

function fillDealsSelectList(deals) {
    const selectElement = document.getElementById('deals_list_picker');
    selectElement.innerHTML = ""; // Clear any previous options
    selectElement.style.top = selectElement.parentElement.clientHeight + "px"; // Set the position of the dropdown

    // Filter deals based on the selected installation team member ID
    const filteredDeals = selected_installation_team_member_id
        ? deals.filter(deal => Number(deal.assigned_id) === Number(selected_installation_team_member_id))
        : deals; // If no member is selected, use all deals


    // Populate the dropdown with the filtered deals
    filteredDeals.forEach(deal => {
        const option = document.createElement('div');
        option.dataset.deal_id = deal.id; // Set the deal ID
        option.innerText = deal.title; // Display the deal title
        option.classList.add("deals_list_picker_option");

        option.addEventListener("click", () => {
            // Find the selected deal in the filtered list
            selectedDeal = { ...filteredDeals.find(d => d.id === deal.id) }; // Clone the selected deal
            selectedDealId = deal.id; // Update the selected deal ID

            // Update UI elements
            document.getElementById("deal_name_filter").value = deal.title; // Set the input field
            document.getElementById("selected_deal_products").innerHTML = ""; // Clear previous products
            document.getElementById("deal_name_filter").blur(); // Remove focus from input
            document.getElementById("selected_deal_name").innerHTML = deal.title; // Display selected deal name
            document.getElementById("selected_deal_date").innerHTML = new Date(deal.date_create).toISOString().split('T')[0]; // Format and display date

            // Generate product blocks for the selected deal
            selectedDeal.products.forEach(product => generateProductBlock(product));

            // Hide the deals list picker
            document.getElementById('deals_list_picker').classList.add("hidden");
            generateAddProductBlock(); // Call function to add a new product row
        });

        selectElement.appendChild(option); // Append the option to the dropdown
    });
}

function selectProduct(event) {
    const inputValue = event.value.toLowerCase(); // Get the input value
    const availableProductsList = document.getElementById("available_products_list"); // Get the product list element
    availableProductsList.innerHTML = ""; // Clear any existing products
    const availableProductsListBlock = document.querySelector(".available_products_list_block");
    availableProductsListBlock.classList.remove("hidden");
    availableProductsList.classList.remove("hidden");
    // Filter products based on the input value
    const filteredProducts = all_products.filter(product =>
        product.name.toLowerCase().includes(inputValue)
    );

    // If there are no matching products, you can handle it accordingly
    if (filteredProducts.length === 0) {
        const noResultsItem = document.createElement("li");
        noResultsItem.className = "available_product";
        noResultsItem.innerText = "Нет доступных материалов";
        availableProductsList.appendChild(noResultsItem);
        return;
    }

    // Append filtered products to the list
    filteredProducts.forEach(product => {
        const productItem = document.createElement("li");
        productItem.className = "available_product";
        productItem.dataset.product_id = product.id; // Set product ID
        productItem.innerText = product.name; // Set product name
        productItem.addEventListener("click", () => {
            // Handle product selection here
            const productNameInput = event.closest('.select_product_row').querySelector('#product_name');
            productNameInput.value = product.name; // Set the selected product name in the input
            adding_product_name = product.name;
            generateProductBlock(product)
            selectedDeal.products.push(product)
            availableProductsList.innerHTML = ""; // Clear the list after selection
            availableProductsListBlock.classList.add("hidden");
        });
        availableProductsList.appendChild(productItem);
    });
}

function generateProductBlock(product) {
    const { id, name, given_amount } = product;

    // Create the main product container div
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.id = `product_${id}`;

    // Create the remove button container and icon
    const removeBtnDiv = document.createElement("div");
    removeBtnDiv.className = "remove_product_btn";
    const removeIcon = document.createElement("i");
    removeIcon.className = "fa-solid fa-circle-xmark";
    removeBtnDiv.appendChild(removeIcon);

    removeBtnDiv.addEventListener("click", () => {
        // Update products in the original selectedDeal
        selectedDeal.products = selectedDeal.products.filter(p => p.id !== id); // Remove product by ID
        productDiv.remove(); // Remove the product's HTML element from the DOM
        console.log(`Product with ID ${id} removed from deal.`);
    });

    // Create the product name div
    const productNameDiv = document.createElement("div");
    productNameDiv.className = "product_name";
    productNameDiv.id = `product_${id}_name`;
    productNameDiv.innerText = name;

    // Create the product consumption container and input
    const productConsumptionDiv = document.createElement("div");
    productConsumptionDiv.className = "product_consumption";
    const consumptionInput = document.createElement("input");
    consumptionInput.type = "text";
    consumptionInput.name = `product_${id}_given_amount`;
    consumptionInput.id = `given_amount_product_${id}`;
    consumptionInput.value = given_amount || 0;
    consumptionInput.className = "product_consumption_input";
    productConsumptionDiv.appendChild(consumptionInput);

    // Add unit label ("шт") after input
    const unitText = document.createTextNode("шт");
    productConsumptionDiv.appendChild(unitText);

    // Append all parts to the main product container
    productDiv.appendChild(removeBtnDiv);
    productDiv.appendChild(productNameDiv);
    productDiv.appendChild(productConsumptionDiv);

    // Append the product block to the parent container (e.g., #selected_deal_products)
    const parentContainer = document.getElementById("selected_deal_products");
    parentContainer.insertBefore(productDiv, document.querySelector(".select_product_row"))
}

function generateAddProductBlock() {
    const addProductDiv = document.createElement("div");
    addProductDiv.className = "select_product_row";

    // Product name input
    const productNameInput = document.createElement("input");
    productNameInput.type = "text";
    productNameInput.className = "product_name";
    productNameInput.id = "product_name"
    productNameInput.placeholder = "Название материала";
    productNameInput.oninput = function () {
        selectProduct(this);
    };
    productNameInput.addEventListener("focus", () => {
        availableProductsListBlock.classList.remove("hidden")
    })
    productNameInput.addEventListener("blur", () => {
        setTimeout(() => {
            console.log("asd")
            availableProductsListBlock.classList.add("hidden")
        }, 500);
    })

    // Available products list block
    const availableProductsListBlock = document.createElement("div");
    availableProductsListBlock.className = "available_products_list_block hidden";
    const availableProductsList = document.createElement("ul");
    availableProductsList.className = "available_products_list";
    availableProductsList.id = "available_products_list";

    // Add dummy items to the available products list (this can be dynamically populated)
    all_products.forEach(product => {
        const productElem = document.createElement("li");
        productElem.className = "available_product";
        productElem.dataset.product_id = `product_${product.id}`;
        productElem.innerText = product.name;
        availableProductsList.appendChild(productElem);
        productElem.addEventListener("click", () => {
            console.log("asd")
            generateProductBlock(product)
            selectedDeal.products.push(product)
            console.log(product)
        })
    })

    availableProductsListBlock.appendChild(availableProductsList);

    // Product consumption input
    const productConsumptionDiv = document.createElement("div");
    productConsumptionDiv.className = "product_consumption";
    const consumptionInput = document.createElement("input");
    consumptionInput.type = "text";
    consumptionInput.name = `adding_product_consumption`; // Use unique names
    consumptionInput.className = "product_consumption_input";
    consumptionInput.value = 0; // Default value
    productConsumptionDiv.appendChild(consumptionInput);
    productConsumptionDiv.appendChild(document.createTextNode("шт"));

    // Append all elements to the add product div
    addProductDiv.appendChild(productNameInput);
    addProductDiv.appendChild(availableProductsListBlock);
    addProductDiv.appendChild(productConsumptionDiv);

    // Append to the parent container
    const parentContainer = document.getElementById("selected_deal_products"); // Ensure this ID matches your actual container
    parentContainer.appendChild(addProductDiv);

    availableProductsListBlock.style.width = productNameInput.clientWidth + "px";
    availableProductsListBlock.style.top = productNameInput.clientHeight + "px";
}

function searchInstallationTeamMember(event, teamMembersList) {
    const input = event.target.value.toLowerCase();
    const membersListElement = document.getElementById('members_list_picker');
    membersListElement.innerHTML = ""; // Clear previous results
    membersListElement.classList.remove("hidden"); // Show the list

    // Filter members by name if input is not empty
    const filteredMembers = input
        ? teamMembersList.filter(member => member.name.toLowerCase().includes(input))
        : [];

    // Hide the list if no members found
    if (filteredMembers.length <= 0) {
        selected_installation_team_member_id = null;
        fillDealsSelectList(all_deals);
        membersListElement.classList.add("hidden");
        return;
    }

    // Fill the list with filtered members
    filteredMembers.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.innerText = member.name + " " + member.last_name; // Set member name as text
        memberDiv.dataset.member_id = member.id; // Store ID for later use
        memberDiv.classList.add("members_list_picker_option");

        // Add click event listener for each member
        memberDiv.addEventListener("click", () => {
            document.getElementById("installation_team_member_name").value = member.name + " " + member.last_name; // Set input value
            selected_installation_team_member_id = member.id;
            membersListElement.classList.add("hidden"); // Hide the list
            console.log(`Selected member ID: ${member.id}`); // Optional: log selected member ID
            fillDealsSelectList(all_deals);
        });

        membersListElement.appendChild(memberDiv); // Append member option to the list
    });
}

function fillInstallationTeamMembersList(members) {
    const membersListElement = document.getElementById('members_list_picker');
    membersListElement.innerHTML = ""; // Clear previous options
    membersListElement.style.top = membersListElement.parentElement.clientHeight + "px"; // Adjust position if needed

    members.forEach(member => {
        const option = document.createElement('div');
        option.dataset.member_id = member.id; // Store member ID
        option.innerText = member.name + " " + member.last_name; // Set member name as text
        option.classList.add("members_list_picker_option"); // Add class for styling

        // Add click event listener to handle selection
        option.addEventListener("click", () => {
            document.getElementById("installation_team_member_name").value = member.name + " " + member.last_name; // Set the input field with selected member's name
            selected_installation_team_member_id = member.id;
            membersListElement.classList.add("hidden"); // Hide the members list
            // Optionally, store selected member ID for further use
            console.log(`Selected member ID: ${member.id}`);
            fillDealsSelectList(all_deals);
        });

        membersListElement.appendChild(option); // Append the option to the list
    });
}

function updateProductGivenAmount() {
    // Get all input fields with the class 'product_consumption_input'
    const consumptionInputs = document.querySelectorAll('.product_consumption_input');

    // Loop through each input field to get the value and update the corresponding product
    consumptionInputs.forEach(input => {
        const productId = input.id.replace("given_amount_product_", ""); // This assumes the input's id is the product's id
        const newAmount = parseFloat(input.value); // Convert input value to a number

        // Find the product in selectedDeal.products
        const product = selectedDeal.products.find(p => Number(p.id) === Number(productId));

        // Update the given_amount if the product is found and the input value is a valid number
        if (product && !isNaN(newAmount)) {
            product.given_amount = newAmount; // Update the given_amount property
        }
    });
}

async function send() {
    if (selectedDeal.products.length <= 0) {
        alert("Необходимо добавить хотя бы одну позицию!");
        return;
    }
    updateProductGivenAmount();
    if (selectedDeal.products.find(product => product.given_amount <= 0)) {
        alert("Кол-во материала не должно быть равно нулю!")
        return;
    }
    const dealId = selectedDeal.id;
    const assignedId = selectedDeal.assigned_id;
    const products = selectedDeal.products.map(product => {
        if (!product.hasOwnProperty("given_amount")) {
            product.given_amount = 0;
        }
        if (!product.hasOwnProperty("fact_amount")) {
            product.fact_amount = 0;
        }
        if (!product.hasOwnProperty("total")) {
            product.total = 0;
        }
        return product;
    });
    console.log(selectedDeal)
    const res = await (await fetch(BASE_URL + "/update_deal/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            deal_id: dealId,
            products: products,
            assigned_id: assignedId
        })
    })).json();
    console.log(res);
}