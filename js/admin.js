const orderList = document.querySelector(".js-orderList");
let orderData = [];

// 初始化
function init() {
  getOrderList();
}
init();

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
                    <td>${item.createdAt}</td>
                    <td class="orderStatus">
                        <a href="#">${orderStatus}</a>
                    </td>
                    <td>
                        <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
                    </td>
                </tr>`;
      });
      orderList.innerHTML = str;
    });
}
