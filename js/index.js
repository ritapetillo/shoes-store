let addProductForm = document.getElementById("product-form");
let urlFetch = "https://striveschool-api.herokuapp.com/api/product/";
let token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmFiYzRlZjRiY2RlMTAwMTc2MTZhODUiLCJpYXQiOjE2MDUwOTI1OTIsImV4cCI6MTYwNjMwMjE5Mn0.2SWHD0K6PQoHDcPg_XHRsykvtdSQdlP_iEWLgTtbtQ8";
let productTable = document.getElementById("product-table");
let cart = [];
let sort = false;
let currentId = "";
let addNewBtn = document.getElementById("add-new");
let spinner = document.querySelector(".spinner-container");
let cartContainer = document.getElementById("cart-container");

//REST

//GET
//I fetch the products sending an async/await request
const fetchProducts = async (product = "") => {
  const response = await fetch(urlFetch + product, {
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    }),
  });
  let data = await response.json();
  return data;
};

//DELETE
//I fetch the products sending an async/await request
const deleteProduct = async (product = "") => {
  const response = await fetch(urlFetch + product, {
    method: "DELETE",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    }),
  });
  let data = await response.json();
  return data;
};

///BACKOFFICE PAGE
//Handle submit new product
const handleSubmitProduct = async (e) => {
  e.preventDefault();
  let spinner = document.querySelector(".spinner-border ");
  spinner.classList.toggle("d-none");
  let id = (currentId = null ? "" : currentId);
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
    console.log(currentId)
    let methodRequest;
    if (currentId === null) {
        id=""
    } 
  try {
    let response = await fetch(urlFetch + id, {
      body: JSON.stringify(newProduct),
      method: currentId === null ? 'POST' : 'PUT',
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }),
    });
    clearFieldsAddProduct();
    currentId = null;

    if (response.ok) {
      console.log(response);
      id == ""
        ? alert("Product Added Successfully")
        : alert("Product Edited Successfully");
      spinner.classList.toggle("d-none");
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

//handle Edit Product
const openEditModal = async (id) => {
  spinner.classList.remove("d-none");
  let title = document.getElementById("addProductModalLabel");
  title.innerHTML = "Edit Product";

  $("#addProductModal").modal("show");
  currentId = id;
  let product = await fetchProducts(id);

  document.getElementById("product-name-input").value = product.name;
  document.getElementById("product-brand-input").value = product.brand;
  document.getElementById("product-price-input").value = product.price;
  document.getElementById("product-description-input").value =
    product.description;
  document.getElementById("product-image-input").value = product.imageUrl;
  spinner.classList.add("d-none");
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
        <td><a href="details.html?id=${
          product._id
        }"><i class="fas fa-eye"></i></a>
        <i class="fas fa-edit" onclick=' openEditModal(${JSON.stringify(
          product._id
        )})')'></i></a>
        <i class="fas fa-trash-alt" id='${product._id}'></i></td>
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
        product[filterBy]
          .toString()
          .toLowerCase()
          .includes(e.target.value.toString().toLowerCase())
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

const handleDelete = () => {
  let deleteIcons = document.querySelectorAll(".fa-trash-alt");
  deleteIcons.forEach((deleteIcon) => {
      let id = deleteIcon.getAttribute("id");
      console.log(id)
      deleteIcon.addEventListener("click", () => {
        var result = confirm("Are you sure you want to delete this product?");
        if (result) {
            deleteProduct(id).then(res => {
                 window.location.href = "backoffice.html";
            });
            // await deleteProduct(id);
            // window.location.href = "backoffice.html";
           
        }
     
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
       <a href="/details.html?id=${product._id}" <div class="cardImg">
                    <img class="card-img-top" src="${product.imageUrl}" alt="Card image cap"></div></a>
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
  let cart = JSON.parse(localStorage.getItem("savedCart"));

  cartBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      let _id = btn.getAttribute("_id");
      let itemFound = cart.find((item) => item._id === _id);
      if (itemFound) {
        itemFound.quantity += 1;
      } else {
        let item = {
          _id,
          quantity: 1,
        };
        cart.push(item);
      }

      localStorage.setItem("savedCart", JSON.stringify(cart));
      console.log(JSON.parse(localStorage.getItem("savedCart")));
      let cartItemsCount = document.getElementById("items-in-cart");

      let quatityCart = cart.reduce((qt, item) => qt + item.quantity, 0);
      cartItemsCount.innerHTML = quatityCart;
      // renderNavItemsCart(JSON.parse(localStorage.getItem('savedCart')).length)
    });
  });
};

//DETAILS PAGE FUNCITONS
const renderDetails = (product) => {
  //render image
  let image = document.getElementById("product-image");
  image.src = product.imageUrl;
  //render details
  let detailsContainer = document.getElementById("product-details");
  detailsContainer.innerHTML = `
    <h4 class="mb-2">${product.name}</h4>
     <h5 class="mb-3">${product.brand}</h5>
    <div class="card-details d-flex mb-4 ">
    <h5 class="mr-3">$${product.price}</h5>
    <i class="fas fa-cart-plus" _id="${product._id}"></i></div>
     <p>${product.description}</p>
    `;
};

//CART PAGE
const clearCart = () => {
  localStorage.setItem("savedCart", JSON.stringify([]));
  window.location.href = "cart.html";
};

const clearCartContainer = () => {
  cartContainer.querySelectorAll("*").forEach((node) => node.remove());
};

const displayCart = async (cart) => {
  let total = 0;
  await cart.forEach((item, i) => {
    fetchProducts(item._id).then((product) => {
      let div = document.createElement("div");
      div.classList.add("row", "mb-5", "d-flex", "align-items-center");
      div.innerHTML = ` 
                <div class="col-2"><img class='img-fluid' src='${
                  product.imageUrl
                }'></div>
                <div class="col-2">${product.brand}</div>
                <div class="col-5">
                   ${product.name}
                </div>
                <div class="col-1">
                    ${item.quantity}
                </div>
                <div class="col-1">
                     $ ${product.price}
                </div>
            <div class="col-1">
                <i class="fas fa-trash-alt" id='${
                  product._id
                }' onclick=' handleDeleteProductCart(${JSON.stringify(
        product._id
      )})')'></i>
            </div>
            `;
      cartContainer.append(div);
      total = total + parseFloat(product.price);
      let totalContainer = document.getElementById("checkout-total");
      totalContainer.innerHTML = total;
      spinner.classList.add("d-none");
    });
  });

  // cart.forEach(item => {
  //     let product = await fetchProducts(item._id);
  //     console.log(product)
  // })
};

const handleDeleteProductCart = (
  id,
  cart = JSON.parse(localStorage.getItem("savedCart"))
) => {
  spinner.classList.remove("d-none");
  let newCart = cart.filter((item) => item._id != id);
  console.log(newCart);
  localStorage.setItem("savedCart", JSON.stringify(newCart));
  clearCartContainer();
  displayCart(JSON.parse(localStorage.getItem("savedCart")));
};

const handleChangeQuantity = (
  id,
  sign,
  cart = JSON.parse(localStorage.getItem("savedCart"))
) => {};

//window on load
window.onload = async () => {
  //BACKOFFICE PAGE
  if (window.location.href.includes("backoffice")) {
    addNewBtn.addEventListener("click", () => {
      let title = document.getElementById("addProductModalLabel");
      title.innerHTML = "New Product";
      clearFieldsAddProduct();
      currentId = null;
      $("#addProductModal").modal("show");
    });

    addProductForm.onsubmit = (e) => handleSubmitProduct(e);
    spinner.classList.remove("d-none");

    try {
      let products = await fetchProducts();
      spinner.classList.add("d-none");

      renderProducts(products);
      filterProducts(products);
      sortProducts(products);
      handleDelete();
      console.log(products);
    } catch (err) {
      console.log(err);
    }
  }

  //INDEX PAGE
  if (
    window.location.href.includes("index") ||
    window.location.pathname == "/"
  ) {
    spinner.classList.remove("d-none");

    try {
      let products = await fetchProducts();
      spinner.classList.add("d-none");
      console.log(products);
      rederUnder50(products);
      rederBestsellers(products);
      addToCart();
    } catch (err) {
      console.log(err);
    }
  }
  ///DETAILS PAGE
  if (window.location.href.includes("details")) {
    let id = new URLSearchParams(location.search);
    id = id.get("id");
    console.log(id);
    try {
      let product = await fetchProducts(id);
      console.log(product);
      renderDetails(product);
      addToCart();
    } catch (err) {}
  }

  if (window.location.href.includes("cart")) {
    spinner.classList.remove("d-none");
    let cartItems = JSON.parse(localStorage.getItem("savedCart"));

    try {
      let items = await displayCart(cartItems);
    } catch (err) {}
  }
};
