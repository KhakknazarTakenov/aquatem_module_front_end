let all_materials = [];
let all_deals = [];
let all_members = [];
window.addEventListener("load", async () => {
    const firstName = localStorage.getItem("name");
    const lastName = localStorage.getItem("last_name");
    await checkIsUserLogined("warehouse_manager");
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

    fillDealsSelectList(data.data.all_deals)
    document.getElementById("deal_name").addEventListener("focus", (event) => {
        document.getElementById('deals_list_picker').classList.remove("hidden");
    })
    document.getElementById("deal_name").addEventListener("blur", (event) => {
        setTimeout(() => {
            document.getElementById('deals_list_picker').classList.add("hidden");
        }, 500);
    })

    const installationTeamMembers = data.data.installation_department_memebers;

    let materialsList = joinProductData(products.data.products, data.data.all_deals);
    all_materials = materialsList;
    all_deals = data.data.all_deals;
    all_members = installationTeamMembers;
    renderMaterialRows(materialsList);
    let dealsList = data.data.all_deals;
    dealsList.forEach(deal => {
        const elem = createDealElement(deal);
        document.getElementById("deals_list").appendChild(elem);
    })

    filterMembers(null, installationTeamMembers)
    document.getElementById("members_list_picker").classList.add("hidden");
    // document.getElementById('installation_team_member_name').addEventListener('input', () => { renderFilteredDealsElements(applyFilters(dealsList, installationTeamMembers)) });
    document.getElementById('installation_team_member_name').addEventListener('input', (event) => {
        filterMembers(event, installationTeamMembers)
    });
    document.getElementById('installation_team_member_name').addEventListener('blur', (event) => {
        setTimeout(() => {
            document.getElementById("members_list_picker").classList.add("hidden")
        }, 500)
    });
    document.getElementById("installation_team_member_name").addEventListener("focus", (event) => {
        document.getElementById('members_list_picker').classList.remove("hidden");
    })

    document.getElementById('datepicker_from').addEventListener('change', () => {
        renderFilteredDealsElements(applyFilters(dealsList, installationTeamMembers));
    });

    document.getElementById('datepicker_to').addEventListener('change', () => {
        renderFilteredDealsElements(applyFilters(dealsList, installationTeamMembers));
    });
    // document.getElementById('deal_name').addEventListener('input', () => { renderFilteredDealsElements(applyFilters(dealsList, installationTeamMembers)) });

    filterMaterials(null, materialsList)
    document.getElementById("materials_list_picker").classList.add("hidden");
    document.getElementById("product_name").addEventListener('input', (event) => {
        filterMaterials(event, materialsList)
    })
    document.getElementById("product_name").addEventListener("keydown", (event) => handleInputKeydown(event, materialsList));
    document.getElementById("product_name").addEventListener("focus", (event) => {
        document.getElementById('materials_list_picker').classList.remove("hidden");
    })
    document.getElementById("product_name").addEventListener("blur", () => {
        setTimeout(() => {
            document.getElementById("materials_list_picker").classList.add("hidden")
        }, 500)
    })
})

function filterMembers(event, members) {
    const input = event ? event.target.value.toLowerCase() : "";
    const membersListPickerElem = document.getElementById("members_list_picker");

    // Clear previous content
    membersListPickerElem.innerHTML = '';

    // Filter members based on input
    const filteredMembers = members.filter(member => {
        const inputWords = input.split(' ').map(word => word.toLowerCase()).filter(word => word.length > 0);

        return inputWords.every(word =>
            member.name.toLowerCase().includes(word) || member.last_name.toLowerCase().includes(word)
        );
    });

    // Display filtered members in picker
    if (filteredMembers.length > 0) {
        renderFilteredDealsElements(applyFilters(all_deals, all_members));
        membersListPickerElem.classList.remove('hidden'); // Show the picker

        filteredMembers.forEach(member => {
            const memberOption = document.createElement('div');
            memberOption.className = 'members_list_picker_option';
            memberOption.dataset.member_id = member.id;
            memberOption.innerText = `${member.name} ${member.last_name}`;

            // Add click event to select member
            memberOption.addEventListener('click', () => {
                document.getElementById("installation_team_member_name").value = `${member.name} ${member.last_name}`;
                membersListPickerElem.classList.add('hidden'); // Hide picker after selection
                renderFilteredDealsElements(applyFilters(all_deals, all_members));
            });

            membersListPickerElem.appendChild(memberOption);
        });
    } else {
        renderFilteredDealsElements(applyFilters(all_deals, all_members));
        membersListPickerElem.classList.add('hidden'); // Hide picker if no matches
    }
}

function handleInputKeydown(event, materials) {
    if (event.key === "Enter") {
        // Prevent the form from submitting if inside a form
        event.preventDefault();
        // Call filterMaterials when "Enter" is pressed
        filterMaterials(event, materials);
    }
}

function filterMaterials(event = null, materials) {
    const input = event ? event.target.value.toLowerCase() : "";
    const materialsListPickerElem = document.getElementById("materials_list_picker");
    // Clear previous results
    materialsListPickerElem.innerHTML = "";

    // Filter materials by the input value
    const filteredMaterials = input ? materials.filter(material =>
        material.product_name.toLowerCase().includes(input)
    ) : materials;

    if (event?.type === "keydown") {
        materialsListPickerElem.classList.add("hidden");
        renderMaterialRows(filteredMaterials);
        return;
    }

    // Populate the list picker with filtered materials
    filteredMaterials.forEach(material => {
        const materialOption = document.createElement("div");
        materialOption.classList.add("material_option");
        materialOption.dataset.material_id = material.product_id;
        materialOption.innerText = material.product_name;

        // Add click event to set the input value and hide the list
        materialOption.addEventListener("click", () => {
            document.getElementById("product_name").value = material.product_name;
            materialsListPickerElem.classList.add("hidden");
            renderMaterialRows([material]);
        });

        materialsListPickerElem.appendChild(materialOption);
    });

    // Show the list if there are results
    materialsListPickerElem.classList.remove("hidden");
}

function joinProductData(products, allDeals) {
    const productTotals = {};

    // Initialize each product in productTotals with zero values
    products.forEach(product => {
        productTotals[product.id] = {
            product_id: product.id,
            product_name: product.name,
            given_amount: 0,
            fact_amount: 0
        };
    });

    // Iterate through each deal and accumulate values for each product
    allDeals.forEach(deal => {
        deal.products.forEach(dealProduct => {
            if (productTotals[dealProduct.id]) {
                // Accumulate given and fact amounts
                productTotals[dealProduct.id].given_amount += dealProduct.given_amount || 0;
                productTotals[dealProduct.id].fact_amount += dealProduct.fact_amount || 0;
            }
        });
    });

    // Calculate total as the sum of given_amount and fact_amount
    return Object.values(productTotals).map(product => ({
        ...product,
        total: product.given_amount - product.fact_amount
    }));
}

function renderMaterialRows(materialsList) {
    const materialsContainer = document.getElementById('materials_amount_total_list__materials_list'); // Parent container for rows
    materialsContainer.innerHTML = "";

    materialsList.forEach(material => {
        const row = generateMaterialRow(
            material.product_id,
            material.product_name,
            material.given_amount,
            material.fact_amount,
            material.total
        );
        materialsContainer.appendChild(row);
    });
}

function generateMaterialRow(productId, productName, givenAmount, factAmount, total) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'materials_amount_total_list__materials_list__row';
    rowDiv.id = `product_${productId}`;

    // Create and append the product name span
    const nameSpan = document.createElement('span');
    nameSpan.className = 'materials_amount_total_list__materials_list__row__data_text';
    nameSpan.textContent = productName;
    rowDiv.appendChild(nameSpan);

    // Create and append givenAmount, factAmount, and total spans
    const values = [givenAmount, factAmount, total];
    values.forEach(value => {
        const valueSpan = document.createElement('span');
        valueSpan.className = 'materials_amount_total_list__materials_list__row__data_text';
        valueSpan.textContent = value !== null ? value : '-'; // Display '-' if the value is null
        rowDiv.appendChild(valueSpan);
    });

    return rowDiv;
}

function createDealElement(deal) {
    // Create main deal div
    const dealDiv = document.createElement('div');
    dealDiv.className = 'deal';
    dealDiv.id = `deal_${deal.id}`;
    dealDiv.dataset.assigned_id = deal.assigned_id;

    // Create deal info div
    const dealInfoDiv = document.createElement('div');
    dealInfoDiv.className = 'deal_info';

    // Create deal title span
    const dealTitleSpan = document.createElement('span');
    dealTitleSpan.className = 'deal_name';
    dealTitleSpan.textContent = deal.title;

    // Create deal date span
    const dealDateSpan = document.createElement('span');
    dealDateSpan.className = 'deal_date';

    // Format the date to a more readable format if necessary
    const date = new Date(deal.date_create);
    dealDateSpan.textContent = date.toLocaleDateString('ru-RU'); // Russian format: DD.MM.YYYY

    // Append title and date to deal info
    dealInfoDiv.appendChild(dealTitleSpan);
    dealInfoDiv.append(" | ")
    dealInfoDiv.appendChild(dealDateSpan);
    dealDiv.appendChild(dealInfoDiv);

    // Create heading for product list
    const headingDiv = document.createElement('div');
    headingDiv.className = 'deal_products_list__heading';

    // Create headings
    const headings = ['Материал', 'Выдано', 'Факт', 'Разница'];
    headings.forEach(text => {
        const headingSpan = document.createElement('span');
        headingSpan.className = 'font_size_16 bold deal_products_list__heading_row__text';
        headingSpan.textContent = text;
        headingDiv.appendChild(headingSpan);
    });

    // Append heading to deal div
    dealDiv.appendChild(headingDiv);

    // Create materials list div
    const materialsListDiv = document.createElement('div');
    materialsListDiv.className = 'deal_materials_list';

    // Create each product entry
    if (deal.products.length > 0) {
        deal.products.forEach((product, index) => {
            const materialDiv = document.createElement('div');
            materialDiv.className = 'deal_material deal_material_row';
            materialDiv.id = `deal_${deal.id}_product_${product.id}`;

            // Create data spans for product
            const productData = [
                product.name,
                product.given_amount !== null ? `${product.given_amount}` : 0,
                product.fact_amount !== null ? `${product.fact_amount}` : 0,
                product.total !== null ? `${product.total}` : 0
            ];

            productData.forEach(item => {
                const dataSpan = document.createElement('span');
                dataSpan.className = 'deal_material_row_data_text';
                dataSpan.textContent = item;
                materialDiv.appendChild(dataSpan);
            });

            // Append material div to materials list
            materialsListDiv.appendChild(materialDiv);
        });

        // Append materials list to deal div
        dealDiv.appendChild(materialsListDiv);
    }
    const approveBtn = document.createElement("button");
    approveBtn.innerHTML = "Подтвердить";
    approveBtn.classList.add("approve_btn");
    approveBtn.addEventListener("click", async () => {
        const firstName = localStorage.getItem("name");
        const lastName = localStorage.getItem("last_name");
        const res = await (await fetch(
            BASE_URL + "/approve_deal/",
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    initiator_full_name: firstName + " " + lastName,
                    deal_id: deal.id
                })
            }
        )).json();
        if (res.status) {
            alert(`Сделка с id ${deal.id} подтверждена`);
        }
    })
    dealDiv.appendChild(approveBtn);
    return dealDiv;
}

function applyFilters(deals, installationTeamMembers) {
    const memberNameInput = document.getElementById('installation_team_member_name').value.toLowerCase();
    const dateInputFrom = document.getElementById('datepicker_from').value; // Start date input
    const dateInputTo = document.getElementById('datepicker_to').value; // End date input
    const dealNameInput = document.getElementById('deal_name').value.toLowerCase();

    const formatDateToDDMMYYYY = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const inputWords = memberNameInput.split(' ').map(word => word.toLowerCase()).filter(word => word.length > 0);
    const filteredDeals = deals.filter(deal => {
        // Check if memberNameInput matches any installation team member
        let matchedMember = null;
        if (memberNameInput.length > 0) {
            matchedMember = installationTeamMembers.find(member => {
                return inputWords.every(word =>
                    member.name.toLowerCase().includes(word) || member.last_name.toLowerCase().includes(word)
                );
            });
        }
        // Check if deal is assigned to the matched member
        const matchesMemberName = matchedMember ? Number(deal.assigned_id) === Number(matchedMember.id) : memberNameInput.length > 0 ? false : true; // Ignore if no name is inputted

        const dealDate = new Date(deal.date_create);  // Keep deal.date_create as a Date object directly

        // Use extreme dates when inputs are null
        const inputDateFrom = dateInputFrom ? new Date(dateInputFrom) : new Date(-8640000000000000); // Minimum date
        const inputDateTo = dateInputTo ? new Date(dateInputTo) : new Date(8640000000000000); // Maximum date

        // Check if the deal date is within the specified range
        const matchesDate = dealDate >= inputDateFrom && dealDate <= inputDateTo;

        // Check if deal name matches
        const matchesDealName = deal.title.toLowerCase().includes(dealNameInput);

        return matchesMemberName && matchesDate && matchesDealName;
    });

    if (memberNameInput.length > 0) {
        const productIds = new Set();
        filteredDeals.forEach(deal => {
            deal.products.forEach(product => productIds.add(product.id));
        });

        // Filter materials by product IDs
        const filteredMaterials = all_materials.filter(material =>
            productIds.has(material.product_id)
        );

        // Render materials list
        renderMaterialRows(filteredMaterials);
    } else {
        renderMaterialRows(all_materials);
    }

    // Create elements for filtered deals
    const elements = [];
    filteredDeals.forEach(deal => {
        elements.push(createDealElement(deal));
    });

    return elements;
}

function renderFilteredDealsElements(elements) {
    document.getElementById("deals_list").innerHTML = '';
    elements.forEach(elem => {
        document.getElementById("deals_list").appendChild(elem);
    })
}

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

    // Filter deals based on the selected installation team member ID
    deals.forEach(deal => {
        const option = document.createElement('div');
        option.dataset.deal_id = deal.id; // Set the deal ID
        option.innerText = deal.title; // Display the deal title
        option.classList.add("deals_list_picker_option");

        option.addEventListener("click", () => {
            renderFilteredDealsElements(applyFilters(all_deals, all_members))
            document.getElementById('deal_name').value = deal.title;
        });

        selectElement.appendChild(option); // Append the option to the dropdown
    });
}


// Example usage
// const materialsContainer = document.getElementById('materials_amount_total_list'); // Parent container for rows
// const materialRows = [
//     { productId: 1, productName: "Цемент", values: ["5 кг", "5 кг", "5 кг"] },
//     { productId: 2, productName: "Песок", values: ["10 кг", "10 кг", "10 кг"] }
// ];

// materialRows.forEach(material => {
//     const row = generateMaterialRow(material.productId, material.productName, material.values);
//     materialsContainer.appendChild(row);
// });
