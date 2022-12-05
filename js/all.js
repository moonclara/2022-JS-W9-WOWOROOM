const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const discardAllBtn = document.querySelector(".discardAllBtn");
const cartTotal = document.querySelector(".js-total");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

let productData = [];
let cartData = [];

// 初始化
function init() {
  getProductList();
  getCartList();
}
init();

// 取得產品列表
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (response) {
      productData = response.data.products;
      renderProductList();
    })
    .catch(function (error) {
      console.log(error);
    });
}

// 建立函式 消除重複
function combineProductHTMLItem(item) {
  return `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img src="${item.images}"
              alt="">
          <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${item.origin_price}</del>
          <p class="nowPrice">NT$${item.price}</p>
          </li>`;
}

// 畫面渲染
function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductHTMLItem(item);
  });
  productList.innerHTML = str;
}

// 產品篩選
productSelect.addEventListener("change", function (e) {
  const category = e.target.value;
  if (category == "全部") {
    renderProductList();
    return;
  }

  let str = "";
  productData.forEach(function (item) {
    if (category == item.category) {
      str += combineProductHTMLItem(item);
    }
  });
  productList.innerHTML = str;
});

// 加入購物車
productList.addEventListener("click", function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "addCardBtn") {
    return;
  }

  let getProductId = e.target.getAttribute("data-id");
  // console.log(getProductId)

  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === getProductId) {
      numCheck = item.quantity += 1;
    }
  });
  // console.log(numCheck)
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: getProductId,
          quantity: numCheck,
        },
      }
    )
    .then(function (response) {
      // 成功會回傳的內容
      // alert("加入成功")
      getCartList();
    });
});

// 取得購物車列表
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      cartData = response.data.carts;
      cartTotal.textContent = response.data.finalTotal;
      let str = "";
      cartData.forEach(function (item) {
        str += `<tr>
                  <td>
                      <div class="cardItem-title">
                          <img src="${item.product.images}" alt="">
                          <p>${item.product.title}</p>
                      </div>
                  </td>
                  <td>NT$${item.product.price}</td>
                  <td>${item.quantity}</td>
                  <td>NT$${item.product.price * item.quantity}</td>
                  <td class="discardBtn">
                      <a href="#" class="material-icons" data-id=${item.id}>
                          clear
                      </a>
                  </td>
                </tr>`;
      });
      cartList.innerHTML = str;
    });
}

cartList.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    // alert("點到其他東西了");
    return;
  }

  // console.log(cartId);
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then(function (response) {
      alert("單筆刪除成功");
      getCartList();
    });
});

discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      alert("全部購物車刪除成功");
      getCartList();
    })
    .catch(function (error) {
      alert("購物車已經清空，請勿重複點擊");
    });
});

// 送出訂單
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData.length == 0) {
    alert("請加入購物車");
    return;
  }

  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == "" ||
    customerTradeWay == ""
  ) {
    alert("請輸入訂單資訊");
  }

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: customerTradeWay,
          },
        },
      }
    )
    .then(function (response) {
      alert("訂單建立成功");
      document.querySelector("#customerName").value = "";
      document.querySelector("#customerPhone").value = "";
      document.querySelector("#customerEmail").value = "";
      document.querySelector("#customerAddress").value = "";
      document.querySelector("#tradeWay").value = "ATM";
      getCartList();
    });
});
