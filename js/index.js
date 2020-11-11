let addProductForm = document.getElementById("product-form");
let urlFetch = "https://striveschool-api.herokuapp.com/api/product/";
let token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmFiYzRlZjRiY2RlMTAwMTc2MTZhODUiLCJpYXQiOjE2MDUwOTI1OTIsImV4cCI6MTYwNjMwMjE5Mn0.2SWHD0K6PQoHDcPg_XHRsykvtdSQdlP_iEWLgTtbtQ8";
let productTable = document.getElementById("product-table");
let cart = [];
let sort = false;

///BACKOFFICE PAGE
const handleSubmitProduct = async (e) => {
  e.preventDefault();
  let name = document.getElementById("product-name-input").value;
  let brand = document.getElementById("product-brand-input").value;
  let price = document.getElementById("product-price-input").value;
  let description = document.getElementById("product-description-input").value;
  let imageUrl = document.getElementById("product-image-input").value;

  let newProduct = {
    name,
    brand,
    price,
    description,
    imageUrl,
  };

  try {
    let response = await fetch(urlFetch, {
      body: JSON.stringify(newProduct),
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    });
    clearFieldsAddProduct();

    if (response.ok) {
      console.log(response);
      alert("Product Added Successfully");
      window.location.href = "backoffice.html";
    } else {
      alert("Something went wrong!");
    }
  } catch (err) {
    console.log(err);
  }
};

const clearFieldsAddProduct = () => {
  document.getElementById("product-name-input").value = "";
  document.getElementById("product-brand-input").value = "";
  document.getElementById("product-price-input").value = "";
  document.getElementById("product-description-input").value = "";
  document.getElementById("product-image-input").value = "";
};

//I fetch the products sending an async/await request
const fetchProducts = async () => {
  const response = await fetch(urlFetch, {
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    }),
  });
  let data = await response.json();
  return data;
};

//I render the table with all the products by creating and then appending to the table as many 'tr' with prod details as the # of products.
const renderProducts = (products) => {
  products.map((product) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <th scope="row">${product._id}</th>
        <td>${product.name}</td>
        <td>${product.brand}</td>
        <td>${product.description.substring(0, 30)}</td>
        <td>${product.price}</td>
        <td>${product.createdAt}</td>
        <td>${product.updatedAt}</td>
        <td><a href="product.html?id=${
          product._id
        }"><i class="fas fa-edit"></i></a><i class="fas fa-trash-alt"></i></td>
        `;
    productTable.append(tr);
  });
};

//FILTER BY NAME/BRAND/PRICE

//with this function I cler the table so that it's ready to display other data
const clearTable = () => {
  return productTable.querySelectorAll("*").forEach((node) => node.remove());
};

const filterByFunc = (e) => {
  let dropdownMenuBtn = document.querySelector("#dropdownMenuButton");
  filterBy = e.target.name;
  dropdownMenuBtn.innerHTML = e.target.text;
};
const filterProducts = (products) => {
  let dropdownItem = document.querySelectorAll(".dropdown-item");
  // let searchBtn = document.getElementById('search-btn')
  let searchInput = document.getElementById("search-input");

  dropdownItem.forEach((item) =>
    item.addEventListener("click", (e) => {
      filterByFunc(e);
      if (filterBy != "") {
        searchInput.classList.remove("d-none");
        searchInput.placeholder = `Filter by ${e.target.text}`;
      } else {
        searchInput.classList.add("d-none");
      }
    })
  );

  searchInput.addEventListener("keyup", (e) => {
    let filteredProducts = "";
    if (filterBy == "price") {
      filteredProducts = products.filter((product) =>
        product[filterBy].toString().toLowerCase().includes(e.target.value.toString().toLowerCase())
      );
    } else {
      filteredProducts = products.filter((product) =>
        product[filterBy].toLowerCase().includes(e.target.value.toLowerCase())
      );
    }

    //clear table
    clearTable();
    //re-render table
    renderProducts(filteredProducts);
  });
};

//SORT THE TABLE BY NAME (ASC OR DESC)
const sortProducts = (products) => {
  let icons = document.querySelectorAll(".fa-sort");
  icons.forEach((sortIcon) => {
    let criteria = sortIcon.getAttribute("criteria");
    sortIcon.style.cursor = "pointer";
    sortIcon.addEventListener("click", () => {
      let sortedProducts = [];
      if (criteria == "price") {
        switch (sort) {
          case false:
            sortedProducts = products.sort(
              (product1, product2) => product1[criteria] - product2[criteria]
            );
            sort = "cres";
            break;
          case "cres":
            sortedProducts = products.sort(
              (product1, product2) => product2[criteria] - product1[criteria]
            );
            sort = "decr";
            break;
          case "decr":
            sortedProducts = products.sort(
              (product1, product2) => product1._id - product2._id
            );
            sort = false;
            break;
        }
      } else {
        switch (sort) {
          case false:
            sortedProducts = products.sort((product1, product2) =>
              product1[criteria].localeCompare(product2[criteria])
            );
            sort = "cres";
            break;
          case "cres":
            sortedProducts = products.sort((product1, product2) =>
              product2[criteria].localeCompare(product1[criteria])
            );
            sort = "decr";
            break;
          case "decr":
            sortedProducts = products.sort(
              (product1, product2) => product1._id - product2._id
            );
            sort = false;
            break;
        }
      }

      //clear table
      clearTable();
      //render sorted users
      renderProducts(sortedProducts);
    });
  });
};

//INDEX PAGE FUNCITONS

const rederBestsellers = (products) => {
  let productsBS = products.splice(0, 4);
  let containerBestSellers = document.getElementById("bestsellers-container");
  productsBS.forEach((product) => {
    let div = document.createElement("div");
    let classes = ["col-6", "col-md-4", "col-lg-3"];
    div.classList.add(...classes);
    div.innerHTML = `<div class="card">
        <div class="cardImg">
                    <img class="card-img-top" src="${product.imageUrl}" alt="Card image cap"></div>
                    <div class="card-body">
                        <h6 class="card-title ellipsis">${product.name}</h6>
                        <div class="card-details d-flex justify-content-between align-items-start">
                        <h5 class="">$${product.price}</h5>
                        <i class="fas fa-cart-plus" _id="${product._id}"></i></div>
                    </div>`;
    containerBestSellers.append(div);
  });
};

//Render Sale
const rederUnder50 = (products) => {
  let under50 = products.filter((product) => product.price <= 50);
  console.log(under50);
  let containerUnder5 = document.getElementById("under5-container");
  under50.forEach((product) => {
    let div = document.createElement("div");
    let classes = ["col-6", "col-md-4", "col-lg-3"];
    div.classList.add(...classes);
    div.innerHTML = `<div class="card">
        <div class="cardImg">
                    <img class="card-img-top" src="${product.imageUrl}" alt="Card image cap"></div>
                    <div class="card-body">
                        <h6 class="card-title ellipsis">${product.name}</h6>
                        <div class="card-details d-flex justify-content-between align-items-start">
                        <h5 class="">$${product.price}</h5>
                        <i class="fas fa-cart-plus" _id="${product._id}"></i></div>
                    </div>`;
    containerUnder5.append(div);
  });
};

//add items to cart
const addToCart = () => {
  const cartBtn = document.querySelectorAll("main i");
  cartBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      let _id = btn.getAttribute("_id");
      cart.push(_id);
      localStorage.setItem("savedCart", JSON.stringify(cart));
      console.log(JSON.parse(localStorage.getItem("savedCart")));
      let cartItemsCount = document.getElementById("items-in-cart");
      cartItemsCount.innerHTML = JSON.parse(
        localStorage.getItem("savedCart")
      ).length;
      // renderNavItemsCart(JSON.parse(localStorage.getItem('savedCart')).length)
    });
  });
};

//window on load
window.onload = async () => {
  //BACKOFFICE PAGE
  if (window.location.href.includes("backoffice")) {
    addProductForm.onsubmit = (e) => handleSubmitProduct(e);
    try {
      let products = await fetchProducts();
      renderProducts(products);
      filterProducts(products);
      sortProducts(products);
      console.log(products);
    } catch (err) {
      console.log(err);
    }
  }

  //INDEX PAGE
  if (window.location.href.includes("index")) {
    try {
      let products = await fetchProducts();
      console.log(products);
      rederUnder50(products);
      rederBestsellers(products);
      addToCart();
    } catch (err) {
      console.log(err);
    }
  }
};
