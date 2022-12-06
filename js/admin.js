const orderList = document.querySelector(".js-orderList");
const discardAllBtn = document.querySelector(".discardAllBtn");
let orderData = [];

// 初始化
function init() {
  getOrderList();
}
init();

function renderC3() {
  // console.log(orderData);
  // 物件資料蒐集
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.category] === undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });
  // console.log(total);

  // 做出資料關聯
  let categoryAry = Object.keys(total);
  // console.log(categoryAry);
  let newData = [];
  categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  // console.log(newData);

  // C3.js
  let chartCategory = c3.generate({
    bindto: "#chartCategory", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
    },
    color: {
      pattern: ["#6859ca", "#0046be", "#55b885", "#f5c66e"],
    },
  });
}

function renderC3_lv2() {
  // console.log(orderData);
  // 物件資料蒐集
  let obj = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.price * productItem.quantity;
      } else {
        obj[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  // console.log(obj);

  // 做出資料關聯
  let originAry = Object.keys(obj);
  // console.log(originAry);
  let rankSortAry = [];
  originAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  });
  // console.log(rankSortAry);

  // 比大小，降冪排列
  // 目的 : 取營收前三高的品項當主要色塊，把其餘的品項加總起來當成一個色塊
  rankSortAry.sort(function (a, b) {
    return b[1] - a[1];
  });
  // console.log(rankSortAry)

  // 如果筆數超過 4 筆以上，就統整為其他
  // 超過 3 筆後，將第四名之後的價格加總起來放在 otherTotal
  if (rankSortAry.length > 3) {
    let otherTotal = 0;
    rankSortAry.forEach(function (item, index) {
      if (index > 2) {
        // console.log(rankSortAry[index])
        // console.log(rankSortAry[index][1])
        otherTotal += rankSortAry[index][1];
      }
    });
    rankSortAry.splice(3, rankSortAry.length - 1);
    rankSortAry.push(["其他", otherTotal]);
    // console.log(rankSortAry)
  }

  // C3圖表
  let chartItem = c3.generate({
    bindto: "#chartItem", // HTML 元素綁定
    data: {
      type: "pie",
      columns: rankSortAry,
    },
    color: {
      pattern: ["#6859ca", "#0046be", "#55b885", "#f5c66e"],
    },
  });
}

function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      orderData = response.data.orders;

      let str = "";
      orderData.forEach(function (item) {
        // 組時間字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${
          timeStamp.getMonth() + 1
        }/${timeStamp.getDate()}`;

        // 組產品字串
        let productStr = "";
        item.products.forEach(function (productItem) {
          productStr += `<p>${productItem.title}*${productItem.quantity}</p>`;
        });

        // 判斷訂單處理狀態
        let orderStatus = "";
        if (item.paid == true) {
          orderStatus = "已處理";
        } else {
          orderStatus = "未處理";
        }

        // 組訂單字串
        str += `  <tr>
                    <td>${item.id}</td>
                    <td>
                        <p>${item.user.name}</p>
                        <p>${item.user.tel}</p>
                    </td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td>
                        ${productStr}
                    </td>
                    <td>${orderTime}</td>
                    <td class="js-orderStatus">
                        <a href="#" class="orderStatus" data-id="${item.id}" data-status=${item.paid}>${orderStatus}</a>
                    </td>
                    <td>
                        <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                    </td>
                </tr>`;
      });
      orderList.innerHTML = str;
      renderC3();
      renderC3_lv2();
    });
}

orderList.addEventListener("click", function (e) {
  e.preventDefault();
  let targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");

  if (targetClass == "orderStatus") {
    let status = e.target.getAttribute("data-status");
    changeOrderStatus(status, id);
    return;
  }
  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    deleteOrderItem(id);
    return;
  }
});

// 訂單狀態
function changeOrderStatus(status, id) {
  let newStatus;
  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true;
  }

  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("訂單狀態修改成功");
      getOrderList();
    });
}

// 單筆刪除
function deleteOrderItem(id) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("訂單刪除成功");
      getOrderList();
    });
}

// 刪除全部訂單
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("訂單全部刪除成功");
      getOrderList();
    });
});
