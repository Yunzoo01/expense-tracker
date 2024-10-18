
const labels = [
  "Dining",
  "Entertainment",
  "Groceries",
  "Healthcare",
  "Rent",
  "Shopping",
  "Transportation",
  "Etc"
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
          "333333"
        ],
      },
    ],
  },
});



//------- add expense modal --------
//load previous localstorage memories on HTMLList
window.onload = ()=>{
  const storedExpenses = localStorage.getItem("expenses");
  if (storedExpenses) {
    const expenses = JSON.parse(storedExpenses);

    expenses.forEach(expense => {
      const li = document.createElement('li');
      li.classList.add('expense', expense.category);

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


const modal = document.getElementById("Modal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementsByClassName("close")[0];

openModalBtn.onclick = ()=>{
  modal.style.display = "block";
}

closeModalBtn.onclick = ()=> {
  modal.style.display = "none";
}

// if you click the anotal side(except modal), modal is closed.
window.onclick = (e)=> {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

//add the category select 
const categorySelect = document.getElementById('category'); 
labels.forEach(label => {
  const option = document.createElement('option');
  option.value = label.toLowerCase(); 
  option.textContent = label; 
  categorySelect.appendChild(option); 
});

document.getElementById("saveExpense").addEventListener("click", function () {
  const date = document.getElementById("date").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  //prevents localStorage data from being refreshed
  let storedExpenses = localStorage.getItem("expenses");
  storedExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];

  if (date && price && category) {  //requirement : date, price, category
    const expenseData = {
      date: date,
      price: parseFloat(price), 
      category: category,
      note: note
    };

    storedExpenses.push(expenseData); 
    localStorage.setItem("expenses", JSON.stringify(storedExpenses));

    //add expenseList to HTML
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

    // closed the modal
    modal.style.display = "none";
    document.getElementById("date").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";
  }
  
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



