// ===== LOGIN FUNCTION =====
function login() {
  const username = document.getElementById("username").value.trim();
  if (username === "") {
    alert("Please enter your name!");
    return;
  }
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("appPage").style.display = "block";

  // Fill name inside table and header
  document.getElementById("nameInput").value = username;
  document.getElementById("employeeName").innerText = username;
}

// ===== ADD NEW ROW =====
function addRow() {
  const tbody = document.querySelector("#timesheet tbody");
  const rowCount = tbody.rows.length + 1;

  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td><input placeholder="Your name"></td>
    <td>${rowCount}</td>
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
  tbody.appendChild(newRow);
}

// ===== ADD TASK =====
function addTask(btn) {
  const backlogDiv = btn.parentElement.querySelector(".backlog");
  const input = btn.parentElement.querySelector("input");
  if (input.value.trim() === "") return;

  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.innerHTML = `<span>${input.value}</span>`;
  backlogDiv.appendChild(task);
  input.value = "";
}

// ===== DRAG & DROP TASKS =====
document.addEventListener("dragstart", e => {
  if (e.target.classList.contains("task")) {
    e.dataTransfer.setData("text/plain", "");
    e.target.classList.add("dragging");
  }
});

document.addEventListener("dragend", e => {
  if (e.target.classList.contains("task")) {
    e.target.classList.remove("dragging");
  }
});

document.querySelectorAll(".backlog, .inprogress, .done").forEach(zone => {
  zone.addEventListener("dragover", e => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("dragover");
    const dragging = document.querySelector(".dragging");
    if (dragging) zone.appendChild(dragging);
  });
});

// ===== AUTO MOVE TASKS AT WEEK END =====
function moveTasksAtWeekEnd() {
  const today = new Date();

  const rows = document.querySelectorAll("#timesheet tbody tr");
  rows.forEach(row => {
    const backlogDiv = row.querySelector(".backlog");
    const inprogressDiv = row.querySelector(".inprogress");
    const doneDiv = row.querySelector(".done");

    const weekEndInput = row.cells[6].querySelector("input").value;
    if (!weekEndInput) return;

    const weekEndDate = new Date(weekEndInput);

    if (today >= weekEndDate) {
      // Move Backlog → In Progress if any
      while (backlogDiv.children.length > 0) {
        inprogressDiv.appendChild(backlogDiv.children[0]);
      }
      // Move In Progress → Done
      while (inprogressDiv.children.length > 0) {
        doneDiv.appendChild(inprogressDiv.children[0]);
      }
    }
  });
}
setInterval(moveTasksAtWeekEnd, 60 * 1000); // check every 1 minute

// ===== CALCULATE TOTALS =====
function calculateTotals() {
  let work = 0, sick = 0, leave = 0, holiday = 0, other = 0, billable = 0;
  const rows = document.querySelectorAll("#timesheet tbody tr");

  rows.forEach(row => {
    const workVal = Number(row.cells[7].querySelector("input").value) || 0;
    const sickVal = Number(row.cells[8].querySelector("input").value) || 0;
    const leaveVal = Number(row.cells[9].querySelector("input").value) || 0;
    const holidayVal = Number(row.cells[10].querySelector("input").value) || 0;
    const otherVal = Number(row.cells[11].querySelector("input").value) || 0;

    // Auto-calc billable for this row
    const rowBillable = workVal - (sickVal + leaveVal + holidayVal + otherVal);
    row.cells[12].querySelector("input").value = rowBillable;

    work += workVal;
    sick += sickVal;
    leave += leaveVal;
    holiday += holidayVal;
    other += otherVal;
    billable += rowBillable;
  });

  document.getElementById("totalWork").innerText = work;
  document.getElementById("totalSick").innerText = sick;
  document.getElementById("totalLeave").innerText = leave;
  document.getElementById("totalHoliday").innerText = holiday;
  document.getElementById("totalOther").innerText = other;
  document.getElementById("totalBillable").innerText = billable;
}

// ===== EXPORT TO EXCEL =====
function exportToExcel() {
  calculateTotals();
  const table = document.getElementById("timesheet").cloneNode(true);

  table.querySelectorAll(".backlog, .inprogress, .done").forEach(div => {
    let text = Array.from(div.querySelectorAll("span"))
      .map(span => span.innerText).join(", ");
    div.parentElement.innerHTML = text;
  });

  const wb = XLSX.utils.table_to_book(table, {sheet: "Timesheet"});
  XLSX.writeFile(wb, "timesheet.xlsx");
}

// ===== LISTENERS =====
document.addEventListener("input", e => {
  if (e.target.type === "number") calculateTotals();
});

// Initial totals calculation
calculateTotals();
