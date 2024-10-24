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

// updateChart : Chart update function
const updateChart = (chart) => {
  const storedExpenses = localStorage.getItem("expenses");
  if (storedExpenses) {
    const expenses = JSON.parse(storedExpenses);

    const expenseData = labels.map((label) => {
      const total = expenses
        .filter(
          (expense) => expense.category.toLowerCase() === label.toLowerCase()
        )
        .reduce((sum, expense) => sum + expense.price, 0);
      return total;
    });

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
          <img class="category-image" src="img/svg/${
            expense.category
          }.svg" alt="${expense.category}">
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
};

//------- add expense modal --------
const addModal = document.getElementById("addModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.querySelector("#addModal .close");

openModalBtn.onclick = () => {
  addModal.style.display = "block";
};

closeModalBtn.onclick = () => {
  addModal.style.display = "none";
};

//add the category select
const categorySelect = document.getElementById("category");
labels.forEach((label) => {
  const option = document.createElement("option");
  option.value = label.toLowerCase();
  option.textContent = label;
  categorySelect.appendChild(option);
});

//save button click
document.getElementById("saveExpense").addEventListener("click", () => {
  const date = document.getElementById("date").value;
  const price = parseFloat(document.getElementById("price").value);
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  if (checkBudgetLimit(category, price)) {
    return; // Stop adding if over budget
  }

  let storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];

  if (date && price && category) {
    const expenseData = { date, price, category, note };
    storedExpenses.push(expenseData);
    localStorage.setItem("expenses", JSON.stringify(storedExpenses));

    addExpenseToList(category, date, price, note);
    updateChart(myChart);
  }
});

function addExpenseToList(category, date, price, note) {
  const expenseList = document.getElementById("expenseList");
  const li = document.createElement("li");
  li.classList.add("expense", category);

  li.innerHTML = `
      <div class="expense-buttons">
          <img src="img/svg/edit.svg" alt="Edit">
          <img src="img/svg/delete.svg" alt="Delete">
      </div>
      <div>
          <img class="category-image" src="img/svg/${category}.svg" alt="${category}">
          <div class="expense-content">
              <h3>${note || "Unnamed Expense"}</h3>
              <p>${date}</p>
          </div>
      </div>
      <span>$${price}</span>
  `;
  expenseList.appendChild(li);
}

//------- delete expense modal -------
document.getElementById("expenseList").addEventListener("click", (e) => {
  if (e.target && e.target.alt === "Delete") {
    const expenseItem = e.target.closest("li");
    const category = expenseItem.classList[1];
    const price = parseFloat(
      expenseItem.querySelector("span").textContent.replace("$", "")
    );

    let storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    storedExpenses = storedExpenses.filter(
      (exp) => !(exp.category === category && exp.price === price)
    );
    localStorage.setItem("expenses", JSON.stringify(storedExpenses));

    expenseItem.remove();
    updateChart(myChart);
  }
});

const budgets = JSON.parse(localStorage.getItem("budgets")) || {};

function checkBudgetLimit(category, newExpense) {
  const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const totalSpent = storedExpenses
    .filter((exp) => exp.category === category)
    .reduce((sum, exp) => sum + exp.price, 0);

  const newTotal = totalSpent + newExpense;

  if (budgets[category] && newTotal > budgets[category]) {
    window.alert(`Budget exceeded for ${category}!`);
    return true;
  }
  return false;
}

document.getElementById("save-budget").addEventListener("click", () => {
  const category = document.getElementById("budget-selector").value;
  const budget = parseFloat(document.getElementById("budget-input").value);

  if (category === "default" || isNaN(budget)) {
    window.alert("Please select a valid category and enter a budget.");
    return;
  }

  budgets[category] = budget;
  localStorage.setItem("budgets", JSON.stringify(budgets));
  window.alert(`Budget for ${category} set to $${budget}.`);
});

//------- edit expense modal --------
const editModal = document.getElementById("editModal");
const closeEditModalBtn = document.querySelector("#editModal .close");

closeEditModalBtn.onclick = () => {
  editModal.style.display = "none";
};

const editCategorySelector = document.getElementById("editCategory");
labels.forEach((label) => {
  const option = document.createElement("option");
  option.value = label.toLowerCase();
  option.textContent = label;
  editCategorySelector.appendChild(option);
});

let editingExpenseItem; //variable for item after edit
let editingExpenseIndex; // current index

document.getElementById("expenseList").addEventListener("click", (e) => {
  if (e.target && e.target.alt === "Edit") {
    editModal.style.display = "block";

    editingExpenseItem = e.target.closest("li");

    const storedExpenses = JSON.parse(localStorage.getItem("expenses"));
    const expenseList = Array.from(
      document.querySelectorAll("#expenseList li")
    );
    editingExpenseIndex = expenseList.indexOf(editingExpenseItem);

    const note = editingExpenseItem.querySelector("h3").textContent;
    const date = editingExpenseItem.querySelector("p").textContent;
    const price = editingExpenseItem
      .querySelector("span")
      .textContent.replace("$", "");
    const categoryImage = editingExpenseItem.querySelector(
      ".expense-content img[alt]"
    );
    const category = categoryImage ? categoryImage.alt.toLowerCase() : "";

    document.getElementById("editDate").value = date;
    document.getElementById("editPrice").value = parseFloat(price);
    document.getElementById("editCategory").value = category;
    document.getElementById("editNote").value = note;
  }
});

const modal = document.getElementById("addModal"); // refer to addModal

//click the edit button
document.getElementById("saveEditExpense").addEventListener("click", () => {
  if (editingExpenseItem) {
    const newDate = document.getElementById("editDate").value;
    const newPrice = document.getElementById("editPrice").value;
    const newCategory = document
      .getElementById("editCategory")
      .value.toLowerCase();
    const newNote = document.getElementById("editNote").value;

    // 기존 카테고리 클래스 제거
    const oldCategory = editingExpenseItem.classList[1];
    if (oldCategory) {
      editingExpenseItem.classList.remove(oldCategory);
    }

    // 새 카테고리 클래스 추가 (빈 문자열이 아닌지 확인)
    if (newCategory && newCategory.trim() !== "") {
      editingExpenseItem.classList.add(newCategory);
    } else {
      console.error("유효하지 않은 카테고리입니다.");
    }

    // 3. 기존 HTML 구조는 유지하고 필요한 부분만 업데이트
    // 제목, 날짜, 금액 업데이트
    editingExpenseItem.querySelector("h3").textContent = newNote;
    editingExpenseItem.querySelector("p").textContent = newDate;
    editingExpenseItem.querySelector("span").textContent = `$${newPrice}`;

    // 4. 카테고리 이미지 및 alt 속성 업데이트
    const categoryImage = editingExpenseItem.querySelector(".category-image");
    if (categoryImage) {
      categoryImage.alt = newCategory.toLowerCase();
      categoryImage.src = `./img/svg/${newCategory.toLowerCase()}.svg`; // 카테고리 이미지 업데이트
    } else {
      console.error("we can not find the category image");
    }

    // 5. 로컬 스토리지 업데이트
    let storedExpenses = JSON.parse(localStorage.getItem("expenses"));
    if (storedExpenses && storedExpenses[editingExpenseIndex]) {
      storedExpenses[editingExpenseIndex] = {
        date: newDate,
        price: parseFloat(newPrice),
        category: newCategory,
        note: newNote,
      };
      localStorage.setItem("expenses", JSON.stringify(storedExpenses));
      console.log(editingExpenseIndex);
    } else {
      console.error("we can not update the localstorage");
    }

    editModal.style.display = "none";
    updateChart(myChart);
  }
});

// Modal for Summary
const sumModal = document.getElementById("sumModal");
const sumBtn = document.getElementById("summary");
const sumCloseBtn = document.querySelector("#sumModal .sumClose");

sumBtn.onclick = () => {
  sumModal.style.display = "block";
  sumCategory.value = "default";
  expenseSummaryContainer.innerHTML = `<div> </div>`;
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
  if (e.target === monthlySummaryModal) {
    monthlySummaryModal.style.display = "none";
  }
};

// Pie chart Setting
const categories = [
  "dining",
  "entertainment",
  "groceries",
  "healthcare",
  "rent",
  "shopping",
  "transportation",
  "etc",
];
var expenseChartCtx = document.getElementById("expenseChart").getContext("2d");
var expenseChart; // variable for chart

function calculateCategoryTotals() {
  const categoryTotals = {};
  categories.forEach((category) => {
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
  const chartLabels = categories.map(
    (category) => category.charAt(0).toUpperCase() + category.slice(1)
  );
  const chartData = categories.map((category) => categoryTotals[category]);

  if (expenseChart) {
    expenseChart.destroy();
  }

  // new chart
  expenseChart = new Chart(expenseChartCtx, {
    type: "pie",
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: "Expenditures",
          data: chartData,
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.7,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Category-wise Expense Distribution",
          color: "black",
          font: {
            size: 26,
          },
          padding: {
            bottom: 10,
          },
        },
      },
    },
  });
}

// Category Selection
var sumCategory = document.getElementById("category-summary");
var expenseSummaryContainer = document.getElementById("expense-summary");

sumCategory.addEventListener("change", function () {
  var selectedCategory = sumCategory.value;
  console.log("Selected category:", selectedCategory);

  updateExpenseSummary(selectedCategory, expenseSummaryContainer);
});

function updateExpenseSummary(selectedCategory, summaryContainer) {
  const expenseItems = document.querySelectorAll(
    `li.expense.${selectedCategory}`
  );

  // Remove previous infos
  summaryContainer.innerHTML = "";

  let sumTotalAmount = 0;

  if (expenseItems.length > 0) {
    const expenseData = [];

    // Collect data into an array
    expenseItems.forEach(function (expenseItem) {
      const title = expenseItem.querySelector("h3").textContent;
      const date = expenseItem.querySelector("p").textContent;
      const amount = expenseItem.querySelector("span").textContent;

      // Push data to expenseData array
      expenseData.push({ date, title, amount });
    });

    // Sort expenseData by date in ascending order
    expenseData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create the table
    const table = document.createElement("table");
    table.classList.add("expense-table");

    // Create table headers
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th>Date</th>
      <th>Title</th>
      <th>Amount</th>
    `;
    table.appendChild(headerRow);

    // Append sorted data to the table
    expenseData.forEach(function (expense) {
      const expenseRow = document.createElement("tr");
      expenseRow.innerHTML = `
        <td>${expense.date}</td>
        <td>${expense.title}</td>
        <td>${expense.amount}</td>
      `;
      table.appendChild(expenseRow);

      // Calculate total amount
      const sumPrice = parseFloat(expense.amount.replace("$", ""));
      sumTotalAmount += sumPrice;
    });

    summaryContainer.appendChild(table);

    // Total amount display
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("total-amount");
    totalDiv.innerHTML = `<hr> <h3>You've spent <i>$${sumTotalAmount.toFixed(
      2
    )}</i> on <i>${selectedCategory}</i> so far.</h3>`;
    summaryContainer.appendChild(totalDiv);
  } else {
    if (selectedCategory !== "default") {
      // When no items in a category
      const noExpensesDiv = document.createElement("div");
      noExpensesDiv.innerHTML = `<h4>No expenses for this category</h4>`;
      summaryContainer.appendChild(noExpensesDiv);
    }
  }
}

// Monthly Summary Modal
// Month Selection
var monthSelector = document.getElementById("month-selector");
var monthlySummaryContainer = document.getElementById("monthly-expenses");

monthSelector.addEventListener("change", function () {
  var selectedMonth = monthSelector.value;
  console.log("Selected month:", selectedMonth);

  const monthlyItems = document.querySelectorAll("#expenseList .expense");

  // Remove previous infos
  monthlySummaryContainer.innerHTML = "";

  let totalAmount = 0;

  if (selectedMonth !== "default") {
    // Create an array to hold the expense data
    const expensesArray = [];

    monthlyItems.forEach(function (monthlyItem) {
      const title = monthlyItem.querySelector("h3").textContent;
      const date = monthlyItem.querySelector("p").textContent;
      const amount = monthlyItem.querySelector("span").textContent;

      // Extract specific month
      const month = date.split("-")[1];

      if (month === selectedMonth) {
        expensesArray.push({
          date: date,
          title: title,
          amount: amount,
        });
      }
    });

    // Sort the expenses by date in ascending order
    expensesArray.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (expensesArray.length > 0) {
      // Create a table element
      const table = document.createElement("table");
      table.classList.add("expense-table");

      // Create table headers
      const headerRow = document.createElement("tr");
      headerRow.innerHTML = `
        <th>Date</th>
        <th>Title</th>
        <th>Amount</th>
      `;
      table.appendChild(headerRow);

      // Populate the table with the sorted expenses
      expensesArray.forEach((expense) => {
        const expenseRow = document.createElement("tr");
        expenseRow.innerHTML = `
          <td>${expense.date}</td>
          <td>${expense.title}</td>
          <td>${expense.amount}</td>
        `;
        table.appendChild(expenseRow);

        // Calculate total amount
        const sumPrice = parseFloat(expense.amount.replace("$", ""));
        totalAmount += sumPrice;
      });

      // Append the table to the summary container
      monthlySummaryContainer.appendChild(table);

      // Convert Months
      let translatedMonth = "";
      if (selectedMonth == "01") {
        translatedMonth = "January";
      } else if (selectedMonth == "02") {
        translatedMonth = "Feburary";
      } else if (selectedMonth == "03") {
        translatedMonth = "March";
      } else if (selectedMonth == "04") {
        translatedMonth = "April";
      } else if (selectedMonth == "05") {
        translatedMonth = "May";
      } else if (selectedMonth == "06") {
        translatedMonth = "June";
      } else if (selectedMonth == "07") {
        translatedMonth = "July";
      } else if (selectedMonth == "08") {
        translatedMonth = "August";
      } else if (selectedMonth == "09") {
        translatedMonth = "September";
      } else if (selectedMonth == "10") {
        translatedMonth = "October";
      } else if (selectedMonth == "11") {
        translatedMonth = "November";
      } else if (selectedMonth == "12") {
        translatedMonth = "December";
      }

      // Total amount display
      const totalDiv = document.createElement("div");
      totalDiv.classList.add("total-amount");
      totalDiv.innerHTML = `<hr> <h3>You spent <i>$${totalAmount.toFixed(
        2
      )}</i> in <i>${translatedMonth}</i>.</h3>`;
      monthlySummaryContainer.appendChild(totalDiv);
    } else {
      // If no expenses for the selected month, display a message
      const noExpensesDiv = document.createElement("div");
      noExpensesDiv.innerHTML = `<h4>No expenses for this month</h4>`;
      monthlySummaryContainer.appendChild(noExpensesDiv);
    }
  }
});

// bar chart
const monthlySummaryModal = document.getElementById("monthlySummaryModal");
const budgetCapModal = document.getElementById("budgetCap");
const openMonthlyBtn = document.getElementById("monthly");
const openBudgetBtn = document.getElementById("budget");
const closeBudgetBtn = document.getElementById("close-budget");
const closeMonthlyBtn = document.getElementById("close-monthly");

openBudgetBtn.onclick = function () {
  budgetCapModal.style.display = "block";
};

closeBudgetBtn.onclick = function () {
  budgetCapModal.style.display = "none";
};

// Open
openMonthlyBtn.onclick = function () {
  monthlySummaryModal.style.display = "block";
  monthSelector.value = "default";
  monthlySummaryContainer.innerHTML = `<div> </div>`;
  updateMonthlyBarChart();
};

// Close
closeMonthlyBtn.onclick = function () {
  monthlySummaryModal.style.display = "none";
};

// Create or Update Bar Chart
let monthlyExpenseChart;

function updateMonthlyBarChart() {
  const monthlyTotals = calculateMonthlyTotals();
  const months = Object.keys(monthlyTotals);
  const chartData = Object.values(monthlyTotals);

  const ctx = document.getElementById("monthlyExpenseChart").getContext("2d");

  if (monthlyExpenseChart) {
    monthlyExpenseChart.destroy();
  }

  monthlyExpenseChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Monthly Expenses",
          data: chartData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 1000,
          title: {
            display: true,
            text: "Expense Amount ($)",
            font: {
              size: 16,
            },
            ticks: {
              stepSize: 100,
              callback: function (value) {
                return value.toLocaleString();
              },
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
        title: {
          display: true,
          text: "Monthly Expense Summary",
          font: {
            size: 20,
            family: "Arial",
          },
          color: "#000",
        },
      },
    },
  });
}

// Function to calculate totals per month
function calculateMonthlyTotals() {
  const monthlyTotals = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  const expenseItems = document.querySelectorAll("li.expense");

  expenseItems.forEach(function (expenseItem) {
    const dateText = expenseItem.querySelector("p").textContent;
    const month = new Date(dateText).toLocaleString("default", {
      month: "long",
    });
    const amount = parseFloat(
      expenseItem.querySelector("span").textContent.replace("$", "")
    );

    if (monthlyTotals[month] !== undefined) {
      monthlyTotals[month] += amount;
    }
  });

  return monthlyTotals;
}
