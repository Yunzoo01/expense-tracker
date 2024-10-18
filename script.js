const labels = [
  "Dining",
  "Entertainment",
  "Groceries",
  "Healthcare",
  "Rent",
  "Shopping",
  "Transportation",
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

new Chart(ctx, {
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
        ],
      },
    ],
  },
});

// Modal for Summary
var sumModal = document.getElementById("sumModal");
var sumBtn = document.getElementById("summary");
var sumSpan = document.getElementsByClassName("close")[0];

sumBtn.onclick = function () {
  sumModal.style.display = "block";
}

sumSpan.onclick = function () {
  sumModal.style.display = "none";
}

window.onclick = function (e) {
  if (e.target == sumModal) {
    sumModal.style.display = "none";
  }
}

// Category Selection
var sumCategory = document.getElementById('category-summary');
var expenseSummaryContainer = document.getElementById('expense-summary');

sumCategory.addEventListener('change', function () {
  var selectedCategory = sumCategory.value;
  console.log("Selected category:", selectedCategory);

  const expenseItems = document.querySelectorAll(`li.expense.${selectedCategory}`);

  // remove previous infos
  expenseSummaryContainer.innerHTML = "";

  let sumTotalAmount = 0;

  if (expenseItems.length > 0) {
    expenseItems.forEach(function (expenseItem) {
      const title = expenseItem.querySelector('h3').textContent;
      const date = expenseItem.querySelector('p').textContent;
      const amount = expenseItem.querySelector('span').textContent;

      const expenseDiv = document.createElement('div');
      expenseDiv.classList.add('expense-item');
      expenseDiv.innerHTML = `<span>${date} ${title} ${amount}</span>`;
      expenseSummaryContainer.appendChild(expenseDiv);

      // price
      const sumPrice = parseFloat(amount.replace('$', ''));
      sumTotalAmount += sumPrice;
    });
    const totalDiv = document.createElement('div');
    totalDiv.classList.add('total-amount');
    totalDiv.innerHTML = `<hr> <h3>Total: $${sumTotalAmount.toFixed(2)}</h3>`;
    expenseSummaryContainer.appendChild(totalDiv);
  }
  else {
    if (selectedCategory != "default") {
      // when no items in a category
      const noExpensesDiv = document.createElement('div');
      noExpensesDiv.textContent = "No expenses for this category";
      expenseSummaryContainer.appendChild(noExpensesDiv);
    }
  }
});



