<script>
  // Load entries from localStorage or initialize empty array
  let entries = JSON.parse(localStorage.getItem("entries")) || [];
  let configuredYear = new Date().getFullYear();
  let configuredTrolley = "all";
  let editIndex = -1;

  // On window load, set today's date and render data
  window.onload = function() {
    let today = new Date().toISOString().split('T')[0];
    document.getElementById("billDate").value = today;
    renderEntries();
    updateSummaryTable();
  };

  // Save entries array to localStorage
  function saveData() {
    localStorage.setItem("entries", JSON.stringify(entries));
  }

  // Apply year and trolley filter and update summary table
  function applyConfig() {
    configuredYear = document.getElementById("configYear").value || new Date().getFullYear();
    configuredTrolley = document.getElementById("configTrolley").value;
    updateSummaryTable();
  }

  // Add a new entry from form inputs
  function addEntry() {
    let entry = {
      name: document.getElementById("personName").value.trim(),
      village: document.getElementById("village").value.trim(),
      trolley: document.getElementById("trolley").value.trim(),
      colour: document.getElementById("colour").value.trim(),
      billNo: document.getElementById("billNo").value.trim(),
      date: document.getElementById("billDate").value,
      status: "Pending",
      year: new Date(document.getElementById("billDate").value).getFullYear()
    };

    if(!entry.name || !entry.village || !entry.trolley || !entry.billNo || !entry.date) {
      alert("Please fill in all required fields.");
      return;
    }

    // Insert new entry at the beginning (so newest shows first)
    entries.unshift(entry);

    saveData();          
    renderEntries();     
    updateSummaryTable();
    clearForm();         
  }

  // Populate form to edit an entry
  function editEntry(index) {
    editIndex = index;
    let e = entries[index];
    document.getElementById("personName").value = e.name;
    document.getElementById("village").value = e.village;
    document.getElementById("trolley").value = e.trolley;
    document.getElementById("colour").value = e.colour;
    document.getElementById("billNo").value = e.billNo;
    document.getElementById("billDate").value = e.date;

    document.getElementById("addBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "inline-block";
  }

  // Update an existing entry from the form inputs
  function updateEntry() {
    if(editIndex === -1) return;

    let e = entries[editIndex];
    e.name = document.getElementById("personName").value.trim();
    e.village = document.getElementById("village").value.trim();
    e.trolley = document.getElementById("trolley").value.trim();
    e.colour = document.getElementById("colour").value.trim();
    e.billNo = document.getElementById("billNo").value.trim();
    e.date = document.getElementById("billDate").value;
    e.year = new Date(e.date).getFullYear();

    if(!e.name || !e.village || !e.trolley || !e.billNo || !e.date) {
      alert("Please fill in all required fields.");
      return;
    }

    saveData();
    clearForm();
    document.getElementById("addBtn").style.display = "inline-block";
    document.getElementById("updateBtn").style.display = "none";

    renderEntries();
    updateSummaryTable();
    editIndex = -1;
  }

  // Delete an entry by index after confirmation
  function deleteEntry(index) {
    if (confirm("Are you sure you want to delete this entry?")) {
      entries.splice(index, 1);
      saveData();
      renderEntries();
      updateSummaryTable();
    }
  }

  // Clear the form inputs and reset date
  function clearForm() {
    document.getElementById("personName").value = "";
    document.getElementById("village").value = "";
    document.getElementById("trolley").value = "";
    document.getElementById("colour").value = "";
    document.getElementById("billNo").value = "";
    document.getElementById("billDate").value = new Date().toISOString().split('T')[0];
  }

  // Render the entries in the table with search filter and status toggle/edit/delete buttons
  function renderEntries() {
    let tbody = document.querySelector("#entriesTable tbody");
    tbody.innerHTML = "";
    let searchText = document.getElementById("searchBox").value?.toLowerCase() || "";

    entries.forEach((e, index) => {
      if (
        e.name.toLowerCase().includes(searchText) ||
        e.village.toLowerCase().includes(searchText) ||
        e.trolley.toLowerCase().includes(searchText) ||
        e.billNo.toLowerCase().includes(searchText)
      ) {
        let statusHtml = e.status === "Completed" 
          ? <span class="complete">Completed ✔</span><br><button class="btn" onclick="toggleStatus(${index})">Mark Pending</button> 
          : <span class="pending">Pending ✖</span><br><button class="btn" onclick="toggleStatus(${index})">Mark Completed</button>;

        let row = `<tr>
          <td>${e.name}</td>
          <td>${e.village}</td>
          <td>${e.trolley}</td>
          <td>${e.colour}</td>
          <td>${e.billNo}</td>
          <td>${e.date}</td>
          <td>${statusHtml}</td>
          <td>
            <button class="btn" onclick="editEntry(${index})">✏ Edit</button>
            <button class="btn deleteBtn" onclick="deleteEntry(${index})">🗑 Delete</button>
          </td>
        </tr>`;
        tbody.innerHTML += row;
      }
    });
  }

  // Toggle between Pending and Completed status of an entry
  function toggleStatus(i) {
    entries[i].status = (entries[i].status === "Completed") ? "Pending" : "Completed";
    saveData();
    renderEntries();
    updateSummaryTable();
  }

  // Update the summary table with counts filtered by year and trolley
  function updateSummaryTable() {
    let tbody = document.querySelector("#summaryTable tbody");
    tbody.innerHTML = "";
    let summary = {};

    entries.forEach(e => {
      if (e.year == configuredYear) {
        if (configuredTrolley === "all" || e.trolley === configuredTrolley) {
          if (!summary[e.trolley]) summary[e.trolley] = {pending:0, completed:0};
          if (e.status === "Completed") summary[e.trolley].completed++;
          else summary[e.trolley].pending++;
        }
      }
    });

    document.getElementById("yearPending").innerText = configuredYear + " Pending";
    document.getElementById("yearCompleted").innerText = configuredYear + " Completed";
    document.getElementById("yearTotal").innerText = configuredYear + " Total";

    if (configuredTrolley === "all") {
      let totalPending = 0, totalCompleted = 0;
      for (let t in summary) {
        totalPending += summary[t].pending;
        totalCompleted += summary[t].completed;
      }
      let row = `<tr>
        <td>All Trolleys</td>
        <td>${totalPending}</td>
        <td>${totalCompleted}</td>
        <td>${totalPending + totalCompleted}</td>
      </tr>`;
      tbody.innerHTML += row;
    } else {
      for (let trolley in summary) {
        let s = summary[trolley];
        let row = `<tr>
          <td>${trolley}</td>
          <td>${s.pending}</td>
          <td>${s.completed}</td>
          <td>${s.pending + s.completed}</td>
        </tr>`;
        tbody.innerHTML += row;
      }
    }
  }
</script>