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
const sumCloseBtn = document.querySelector("#sumModal .sumClose");

sumBtn.onclick = () => {
  sumModal.style.display = "block";
  updatePieChart();
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

// Pie chart Setting
const categories = ["dining", "entertainment", "groceries", "healthcare", "rent", "shopping", "transportation", "etc"];
var expenseChartCtx = document.getElementById("expenseChart").getContext("2d");
var expenseChart; // variable for chart

function calculateCategoryTotals() {
  const categoryTotals = {};
  categories.forEach(category => {
    const expenseItems = document.querySelectorAll(`li.expense.${category}`);
    let categoryTotal = 0;

    expenseItems.forEach(function (expenseItem) {
      const amount = expenseItem.querySelector("span").textContent;
      const sumPrice = parseFloat(amount.replace("$", ""));
      categoryTotal += sumPrice;
    });

    categoryTotals[category] = categoryTotal;
  });

  return categoryTotals;
}

// Create or Update Chart
function updatePieChart() {
  const categoryTotals = calculateCategoryTotals();
  const chartLabels = categories.map(category => category.charAt(0).toUpperCase() + category.slice(1));
  const chartData = categories.map(category => categoryTotals[category]);

  if (expenseChart) {
    expenseChart.destroy();
  }

  // new chart
  expenseChart = new Chart(expenseChartCtx, {
    type: "pie",
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "grey"],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: 'Category-wise Expense Distribution',
          color: 'black',
          font: {
            size: 48
          }
        }
      }
    }
  });
}

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


// Monthly Summary Modal
// List
// Month Selection
var monthSelector = document.getElementById("month-selector");
var monthlySummaryContainer = document.getElementById("monthly-expenses");

monthSelector.addEventListener("change", function () {
  var selectedMonth = monthSelector.value;
  console.log("Selected month:", selectedMonth);

  const monthlyItems = document.querySelectorAll("#expenseList .expense");

  // remove previous infos
  monthlySummaryContainer.innerHTML = "";

  let totalAmount = 0;

  if (selectedMonth !== "default") {
    monthlyItems.forEach(function (monthlyItem) {
      const title = monthlyItem.querySelector("h3").textContent;
      const date = monthlyItem.querySelector("p").textContent;
      const amount = monthlyItem.querySelector("span").textContent;
      // console.log(title, date, amount);

      // extract specific month
      const month = date.split('-')[1];
      // console.log(month, typeof month);

      if (month === selectedMonth) {
        const expenseDiv = document.createElement("div");
        expenseDiv.innerHTML = `<span>${date} ${title} ${amount}</span>`;
        monthlySummaryContainer.appendChild(expenseDiv);

        // price
        const sumPrice = parseFloat(amount.replace("$", ""));
        totalAmount += sumPrice;
      }
    });

    // Total amount display
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("total-amount");
    totalDiv.innerHTML = `<hr> <h3>Total: $${totalAmount.toFixed(2)}</h3>`;
    monthlySummaryContainer.appendChild(totalDiv);
  } else {
    if (selectedMonth != "default") {
      const noExpensesDiv = document.createElement("div");
      noExpensesDiv.textContent = "No expenses for this month";
      monthlySummaryContainer.appendChild(noExpensesDiv);
    }
  }
});




// bar chart
const monthlySummaryModal = document.getElementById("monthlySummaryModal");
const openMonthlyBtn = document.getElementById("monthly");
const closeMonthlyBtn = document.getElementById("close-monthly");

// Open
openMonthlyBtn.onclick = function () {
  monthlySummaryModal.style.display = "block";
  updateMonthlyBarChart();
}

// Close
closeMonthlyBtn.onclick = function () {
  monthlySummaryModal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target === monthlySummaryModal) {
    monthlySummaryModal.style.display = "none";
  }
}

// Create or Update Bar Chart
let monthlyExpenseChart;

function updateMonthlyBarChart() {
  const monthlyTotals = calculateMonthlyTotals();
  const months = Object.keys(monthlyTotals);
  const chartData = Object.values(monthlyTotals);

  const ctx = document.getElementById('monthlyExpenseChart').getContext('2d');

  if (monthlyExpenseChart) {
    monthlyExpenseChart.destroy();
  }

  monthlyExpenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Monthly Expenses',
        data: chartData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 3000,
          title: {
            display: true,
            text: 'Expense Amount ($)',
            font: {
              size: 16,
            },
            ticks: {
              stepSize: 100,
              callback: function (value) {
                return value.toLocaleString();
              }
            }
          }
        }
      },
      plugins: {
        legend: {
          display: true
        },
        title: {
          display: true,
          text: 'Monthly Expense Summary',
          font: {
            size: 20,
            family: 'Arial'
          },
          color: '#000'
        }
      }
    }
  });
}

// Function to calculate totals per month
function calculateMonthlyTotals() {
  const monthlyTotals = {
    January: 0, February: 0, March: 0, April: 0,
    May: 0, June: 0, July: 0, August: 0,
    September: 0, October: 0, November: 0, December: 0
  };

  const expenseItems = document.querySelectorAll('li.expense');

  expenseItems.forEach(function (expenseItem) {
    const dateText = expenseItem.querySelector("p").textContent;
    const month = new Date(dateText).toLocaleString('default', { month: 'long' });
    const amount = parseFloat(expenseItem.querySelector("span").textContent.replace("$", ""));

    if (monthlyTotals[month] !== undefined) {
      monthlyTotals[month] += amount;
    }
  });

  return monthlyTotals;
}