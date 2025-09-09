
// Selectors
const treeShowcaseWrapper   = document.getElementById('tree-showcase-wrapper');
const categoriesWrapper     = document.getElementById('categories-wrapper');
const cartItemWrapper       = document.getElementById('cart-item-wrapper');
const cartTotalWrapper      = document.getElementById('cart-total-wrapper');

// Fetch API Data
const getData = async url => {
    const result = await fetch(url);
    return result.json();
}

// Display loading bar based on condition
const showLoadingBar = isShow => {
    const loadingBar = document.getElementById('loading-bar');
    if(isShow) {
        loadingBar.classList.remove('hidden');
        treeShowcaseWrapper.classList.add('hidden');
    } else {
        loadingBar.classList.add('hidden');
        treeShowcaseWrapper.classList.remove('hidden');
    }
}

// Get Category
const getCategory = () => {
    getData('https://openapi.programming-hero.com/api/categories')
    .then(data => showCategory(data.categories));
}

// Show category on the UI
const showCategory = categories => {
    categories.forEach(category => {
        const {id, category_name: title} = category;
        const div = document.createElement('div');
        div.classList.add('category-label');
        div.innerHTML = `
          <li onclick="getAllTrees('https://openapi.programming-hero.com/api/category/${id}')" 
              class="category-li text-base cursor-pointer p-2">${title}</li>
        `;
        categoriesWrapper.appendChild(div);
    });
}

// Get All Trees
const getAllTrees = (url = 'https://openapi.programming-hero.com/api/plants') => {
    showLoadingBar(true);
    getData(url)
    .then(data => {
        const plants = data.plants || data.data || [];
        showAllTrees(plants);
    });
}

// Show All Trees on the UI
const showAllTrees = plants => {
    showLoadingBar(false);
    treeShowcaseWrapper.innerHTML = '';

    plants.forEach(plant => {
        const {plant_id, image, plant_name, description, category, price, plant_price, name} = plant;
        const shortDescription = description?.split(' ').slice(0, 14).join(' ') || '';
        const finalPrice = price || plant_price || 0;
        const finalName = plant_name || name || "Unknown Plant";

        treeShowcaseWrapper.innerHTML += `
            <div class="tree-showcase-item bg-white p-4 rounded-lg h-max">
                <img class="w-full h-[185px] rounded-lg object-cover" src="${image}" alt="${finalName}">
                <h5 onclick="showTreeDetails('${plant_id}')" class="tree-title text-sm font-semibold text-[#1f2937] mt-3 mb-2 cursor-pointer">${finalName}</h5>
                <p class="text-xs text-[#1f2937] opacity-80">${shortDescription}</p>
                <div class="tree-item-category flex justify-between mt-2 mb-3">
                    <p class="text-sm bg-[#dcfce7] py-1 px-2 rounded-full text-[#15803D] font-medium">${category}</p>
                    <p class="text-sm font-semibold">৳<span class="tree-price">${finalPrice}</span></p>
                </div>
                <button onclick="addToCart(this)" id="add-to-cart-btn-${plant_id}" 
                    class="p-3 w-full block text-center bg-[#15803d] text-white text-base rounded-full font-medium cursor-pointer">
                    Add to Cart
                </button>
            </div>
        `;
    });
}

// Show tree details when clicked
const showTreeDetails = id => {
    const treeDetailsModal = document.getElementById('tree_details_modal');
    const modalContainer = document.getElementById('modal-container');
    treeDetailsModal.showModal();

    getData(`https://openapi.programming-hero.com/api/plant/${id}`)
    .then(data => {
        const {image, plant_name, description, category, price, plant_price, name} = data.plant;
        const finalPrice = price || plant_price || 0;
        const finalName = plant_name || name || "Unknown Plant";

        modalContainer.innerHTML = `
            <div class="tree-showcase-item">
                <img class="w-full h-[400px] rounded-lg object-cover" src="${image}" alt="${finalName}">
                <h5 class="text-sm font-semibold text-[#1f2937] mt-3 mb-2 cursor-pointer">${finalName}</h5>
                <p class="text-xs text-[#1f2937] opacity-80">${description}</p>
                <div class="tree-item-category flex justify-between mt-2 mb-3">
                    <p class="text-sm bg-[#dcfce7] py-1 px-2 rounded-full text-[#15803D] font-medium">${category}</p>
                    <p class="text-sm font-semibold">৳<span class="tree-price">${finalPrice}</span></p>
                </div>
            </div>
        `;
    });
}

// Remove active class
const removeActive = () => {
    const categoryLI = document.querySelectorAll('.category-li');
    categoryLI.forEach(items => {
        items.classList.remove('active');
    });
}

// Add active class
const showActive = () => {
    categoriesWrapper.addEventListener('click', (e) => {
        if(e.target.tagName === 'LI') {
            removeActive();
            e.target.classList.add('active');
        }
    })
}

// Cart system
let totalPrice = 0;

cartItemWrapper.addEventListener('click', (e) => {
    if(e.target.id === 'cross-icon') {
        const item = e.target.closest('.cart-item');
        const removedItemPrice = item.querySelector('.cart-item-details-price').innerText;
        item.remove();
        totalPrice -= parseInt(removedItemPrice);
        isDisplayTotal();
    }
});


const addToCart = target => {
    let itemCount = 1;

    const treeTitle = target.parentNode.querySelector('.tree-title');
    const treePrice = target.parentNode.querySelector('.tree-price');
    const treeImage = target.parentNode.querySelector('img'); 

    alert(`${treeTitle.innerText} added to the cart`);

    cartItemWrapper.innerHTML += `
        <div class="cart-item bg-[#f0fdf4] py-2 px-3 mt-2 rounded-lg shadow-sm">
            <div class="flex items-center gap-3">
                <img class="w-12 h-12 object-cover rounded" src="${treeImage.src}" alt="${treeTitle.innerText}">
                <div class="cart-item-details flex-1">
                    <div class="flex justify-between items-center">
                        <h5 class="text-sm font-semibold text-[#1f2937]">${treeTitle.innerText}</h5>
                        <img id="cross-icon" src="./assets/close.png" alt="Close" class="w-5 h-5 cursor-pointer">
                    </div>
                    <p class="text-[#1f2937] opacity-50 text-sm">৳<span class="cart-item-details-price">${treePrice.innerText}</span> x <span class="cart-item-details-quantity">${itemCount}</span></p>
                </div>
            </div>
        </div>
    `;

    totalPrice += parseInt(treePrice.innerText);
    isDisplayTotal();
}

// Display total wrapper
const isDisplayTotal = () => {
    const cartItems = document.getElementsByClassName('cart-item');

    if(cartItems.length > 0) {
        cartTotalWrapper.classList.remove('hidden');
        cartTotalWrapper.innerHTML = `
            <p>Total:</p>
            <p>৳<span class="total-price">${totalPrice}</span></p>
        `;
    } else {
        cartTotalWrapper.classList.add('hidden');
    }
}

// Function invoked
showActive();
getCategory();
getAllTrees();
