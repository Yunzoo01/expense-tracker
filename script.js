const labels = [
  "Dining",
  "Entertainment",
  "Groceries",
  "Healthcare",
  "Rent",
  "Shopping",
  "Transportation",
  "Etc",
];

const expenseData = labels.map((label) => {
  const total = Array.from(
    document.querySelectorAll(`.expense.${label.toLowerCase()}`)
  ).reduce((sum, item) => {
    const amountText = item.querySelector("span").innerText;
    const amount = parseFloat(amountText.replace("$", "").replace(",", ""));
    return sum + amount;
  }, 0);
  return total;
});

console.log(expenseData);

const ctx = document.getElementById("myChart");
const myChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Value Spent",
        data: expenseData,
        borderWidth: 1,
        backgroundColor: [
          "#abf5fa",
          "#d9abfa",
          "#fff698",
          "#ff9898",
          "#98c6ff",
          "#ffc398",
          "#a2ff98",
          "#a6a6a6",
        ],
      },
    ],
  },
});

// Chart update function
const updateChart = (chart) => {
  const storedExpenses = localStorage.getItem("expenses");
  if (storedExpenses) {
    const expenses = JSON.parse(storedExpenses);

    // 카테고리별 지출 금액을 계산
    const expenseData = labels.map((label) => {
      const total = expenses
        .filter((expense) => expense.category.toLowerCase() === label.toLowerCase())
        .reduce((sum, expense) => sum + expense.price, 0);
      return total;
    });

    // 차트 데이터 업데이트
    chart.data.datasets[0].data = expenseData;
    chart.update();
  }
};


// loadExpenses : load previous localstorage memories on HTMLList
const loadExpenses = () => {
  const storedExpenses = localStorage.getItem("expenses");
  if (storedExpenses) {
    const expenses = JSON.parse(storedExpenses);

    expenses.forEach((expense) => {
      const li = document.createElement("li");
      li.classList.add("expense", expense.category);

      li.innerHTML = `
        <div class="expense-buttons">
          <img src="img/svg/edit.svg" alt="Edit">
          <img src="img/svg/delete.svg" alt="Delete">
        </div>
        <div>
          <img src="img/svg/${expense.category}.svg" alt="${expense.category}">
          <div class="expense-content">
            <h3>${expense.note ? expense.note : "Unnamed Expense"}</h3>
            <p>${expense.date}</p>
          </div>
        </div>
        <span>$${expense.price}</span>
      `;

      document.getElementById("expenseList").appendChild(li);
    });
  }
};
window.onload = () => {
  loadExpenses();
  updateChart(myChart);
}

//------- add expense modal --------
const modal = document.getElementById("Modal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.querySelector("#Modal .close");

openModalBtn.onclick = () => {
  modal.style.display = "block";
};

closeModalBtn.onclick = () => {
  modal.style.display = "none";
};

//add the category select
const categorySelect = document.getElementById("category");
labels.forEach((label) => {
  const option = document.createElement("option");
  option.value = label.toLowerCase();
  option.textContent = label;
  categorySelect.appendChild(option);
});

document.getElementById("saveExpense").addEventListener("click", function () {
  const date = document.getElementById("date").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  let storedExpenses = localStorage.getItem("expenses");
  storedExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];

  if (date && price && category) {
    const expenseData = {
      date: date,
      price: parseFloat(price),
      category: category,
      note: note,
    };

    storedExpenses.push(expenseData);
    localStorage.setItem("expenses", JSON.stringify(storedExpenses));

    // add expense to HTML
    const expenseList = document.getElementById("expenseList");
    const li = document.createElement("li");
    li.classList.add("expense", category);

    li.innerHTML = `
      <div class="expense-buttons">
        <img src="img/svg/edit.svg" alt="Edit">
        <img src="img/svg/delete.svg" alt="Delete">
      </div>
      <div>
        <img src="img/svg/${category}.svg" alt="${category}">
        <div class="expense-content">
          <h3>${note ? note : "Unnamed Expense"}</h3>
          <p>${date}</p>
        </div>
      </div>
      <span>$${price}</span>
    `;
    expenseList.appendChild(li);

    // 모달 닫기
    modal.style.display = "none";

    // 입력 필드 초기화
    document.getElementById("date").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";

    // 차트 업데이트
    updateChart(myChart);
  }
});



// Modal for Summary
const sumModal = document.getElementById("sumModal");
const sumBtn = document.getElementById("summary");
const sumCloseBtn = document.querySelector("#sumModal .close");

sumBtn.onclick = () => {
  sumModal.style.display = "block";
};

sumCloseBtn.onclick = () => {
  sumModal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
  if (e.target == sumModal) {
    sumModal.style.display = "none";
  }
};

// Category Selection
var sumCategory = document.getElementById("category-summary");
var expenseSummaryContainer = document.getElementById("expense-summary");

sumCategory.addEventListener("change", function () {
  var selectedCategory = sumCategory.value;
  console.log("Selected category:", selectedCategory);

  const expenseItems = document.querySelectorAll(
    `li.expense.${selectedCategory}`
  );

  // remove previous infos
  expenseSummaryContainer.innerHTML = "";

  let sumTotalAmount = 0;

  if (expenseItems.length > 0) {
    expenseItems.forEach(function (expenseItem) {
      const title = expenseItem.querySelector("h3").textContent;
      const date = expenseItem.querySelector("p").textContent;
      const amount = expenseItem.querySelector("span").textContent;

      const expenseDiv = document.createElement("div");
      expenseDiv.classList.add("expense-item");
      expenseDiv.innerHTML = `<span>${date} ${title} ${amount}</span>`;
      expenseSummaryContainer.appendChild(expenseDiv);

      // price
      const sumPrice = parseFloat(amount.replace("$", ""));
      sumTotalAmount += sumPrice;
    });
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("total-amount");
    totalDiv.innerHTML = `<hr> <h3>Total: $${sumTotalAmount.toFixed(2)}</h3>`;
    expenseSummaryContainer.appendChild(totalDiv);
  } else {
    if (selectedCategory != "default") {
      // when no items in a category
      const noExpensesDiv = document.createElement("div");
      noExpensesDiv.textContent = "No expenses for this category";
      expenseSummaryContainer.appendChild(noExpensesDiv);
    }
  }
});
