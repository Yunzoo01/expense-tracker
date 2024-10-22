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
        <img class="category-image" src="img/svg/${category}.svg" alt="${category}">
        <div class="expense-content">
          <h3>${note ? note : "Unnamed Expense"}</h3>
          <p>${date}</p>
        </div>
      </div>
      <span>$${price}</span>
    `;
    expenseList.appendChild(li);

    modal.style.display = "none";

    document.getElementById("date").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";

    updateChart(myChart);
  }
});

//------- delete expense modal -------
document.getElementById("expenseList").addEventListener("click", (e) => {
  if (e.target && e.target.alt === "Delete") {
    const expenseItem = e.target.closest("li");

    if (expenseItem) {
      const categoryImage = expenseItem.querySelector(".category-image");
      let category = "";
      if (categoryImage) {
        category = categoryImage.alt.toLowerCase();
      } else {
        console.error("There is no category image");
        return; 
      }

      const date = expenseItem.querySelector("p").textContent;
      const price = parseFloat(
        expenseItem.querySelector("span").textContent.replace("$", "")
      );

      const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];

      const expenseIndex = storedExpenses.findIndex(
        (expense) =>
          expense.date === date &&
          expense.price === price &&
          expense.category.toLowerCase() === category
      );

      if (expenseIndex > -1) {
        storedExpenses.splice(expenseIndex, 1);
        localStorage.setItem("expenses", JSON.stringify(storedExpenses));

        expenseItem.remove();

        updateChart(myChart);
      }
    }
  }
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