// ===== LOGIN =====
function login() {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter your name.");
    return;
  }

  document.getElementById("employeeName").textContent = username;
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("appPage").style.display = "block";
  document.getElementById("nameInput").value = username;
}

// ===== ADD ROW =====
function addRow() {
  const table = document.getElementById("timesheet").getElementsByTagName("tbody")[0];
  const rowCount = table.rows.length;
  const row = table.insertRow();

  row.innerHTML = `
    <td><input placeholder="Your name"></td>
    <td>${rowCount + 1}</td>
    <td><input type="date"></td>
    <td>
      <div class="backlog"></div>
      <input placeholder="New task...">
      <button onclick="addTask(this)">➕ Add Task</button>
    </td>
    <td><div class="inprogress"></div></td>
    <td><div class="done"></div></td>
    <td><input type="date"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="0" readonly></td>
  `;
}

// ===== ADD TASK =====
function addTask(btn) {
  const input = btn.previousElementSibling;
  const taskText = input.value.trim();
  if (!taskText) return;

  const taskDiv = document.createElement("div");
  taskDiv.className = "task";
  taskDiv.innerHTML = `
    <span>${taskText}</span>
    <button onclick="moveTask(this)">➡</button>
    <button onclick="removeTask(this)">❌</button>
  `;
  btn.parentElement.querySelector(".backlog").appendChild(taskDiv);
  input.value = "";
}

function moveTask(btn) {
  const taskDiv = btn.parentElement;
  const parentCell = taskDiv.parentElement;

  if (parentCell.classList.contains("backlog")) {
    taskDiv.querySelector("button").textContent = "➡";
    document.querySelector(".inprogress").appendChild(taskDiv);
  } else if (parentCell.classList.contains("inprogress")) {
    document.querySelector(".done").appendChild(taskDiv);
    btn.remove(); // No "➡" button once in Done
  }
}

function removeTask(btn) {
  btn.parentElement.remove();
}

// ===== CALCULATE TOTALS =====
function calculateTotals() {
  let totalWork = 0, totalSick = 0, totalLeave = 0, totalHoliday = 0, totalOther = 0, totalBillable = 0;

  const rows = document.querySelectorAll("#timesheet tbody tr");
  rows.forEach(row => {
    const work = Number(row.cells[7].querySelector("input").value) || 0;
    const sick = Number(row.cells[8].querySelector("input").value) || 0;
    const leave = Number(row.cells[9].querySelector("input").value) || 0;
    const holiday = Number(row.cells[10].querySelector("input").value) || 0;
    const other = Number(row.cells[11].querySelector("input").value) || 0;
    const billable = work - (sick + leave + holiday + other);

    row.cells[12].querySelector("input").value = billable;

    totalWork += work;
    totalSick += sick;
    totalLeave += leave;
    totalHoliday += holiday;
    totalOther += other;
    totalBillable += billable;
  });

  document.getElementById("totalWork").textContent = totalWork;
  document.getElementById("totalSick").textContent = totalSick;
  document.getElementById("totalLeave").textContent = totalLeave;
  document.getElementById("totalHoliday").textContent = totalHoliday;
  document.getElementById("totalOther").textContent = totalOther;
  document.getElementById("totalBillable").textContent = totalBillable;
}

// ===== EXPORT TO EXCEL =====
function exportToExcel() {
  const table = document.getElementById("timesheet");
  const wb = XLSX.utils.book_new();
  const ws_data = [];

  // Headers
  const headers = [];
  table.querySelectorAll("thead th").forEach(th => headers.push(th.innerText));
  ws_data.push(headers);

  // Rows
  table.querySelectorAll("tbody tr").forEach(row => {
    const rowData = [];
    row.querySelectorAll("td").forEach((cell, index) => {
      // For Backlog, In Progress, Done → collect all .task text
      if (index === 3 || index === 4 || index === 5) {
        const tasks = [...cell.querySelectorAll(".task span")].map(t => t.innerText);
        rowData.push(tasks.join(", "));
      }
      // For inputs (name, dates, numbers)
      else {
        const input = cell.querySelector("input");
        rowData.push(input ? input.value : cell.innerText.trim());
      }
    });
    ws_data.push(rowData);
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Timesheet");
  XLSX.writeFile(wb, "Timesheet.xlsx");
}
