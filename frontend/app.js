document.addEventListener("DOMContentLoaded", function () {
    showSection("students"); // Show Students section by default

    // Ensure forms exist before adding event listeners
    document.getElementById("studentForm")?.addEventListener("submit", addStudent);
    document.getElementById("teacherForm")?.addEventListener("submit", addTeacher);
    document.getElementById("classForm")?.addEventListener("submit", addClass);
});

// Function to show the selected section
function showSection(section) {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
    document.getElementById(`${section}Section`).style.display = "block";
}
document.addEventListener("DOMContentLoaded", () => {
    ["students", "teachers", "classes"].forEach(fetchData);
});

const BACKEND_URL = "https://school-management-backend-1-ugbc.onrender.com";

function fetchData(type) {
    fetch(`${BACKEND_URL}/api/${type}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${type}: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error(`${type} data is not an array`);
            }
            console.log(`Fetched ${type}:`, data);
            populateTable(type, data);
        })
        .catch(error => console.error(`Error fetching ${type}:`, error));
}

// Populate tables dynamically
function populateTable(type, data) {
    const tableBody = document.getElementById(`${type}TableBody`);
    tableBody.innerHTML = "";
    
    data.forEach((item, index) => {
        const row = document.createElement("tr");
        
        if (type === "classes") {
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.className || "N/A"}</td>
                <td>${item.students !== undefined ? item.students : "N/A"}</td>
                <td>
                    <button onclick="editItem('${type}', ${item.id})">Edit</button>
                    <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
                </td>
            `;
        } else if (type === "students" || type === "teachers") {
            row.innerHTML = `
                <td>
                    <img src="${item.image ? `${BACKEND_URL}${item.image}` : `${BACKEND_URL}/default-placeholder.png`}" 
                         alt="${item.name}" width="50" height="50">
                </td>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${type === "students" ? item.age || "N/A" : item.subject || "N/A"}</td>
                <td>${type === "students" ? item.className || "N/A" : ""}</td>
                <td>
                    <button onclick="editItem('${type}', ${item.id})">Edit</button>
                    <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
                </td>
            `;
        }
        tableBody.appendChild(row);
    });
}

// Add New Entry
function addEntry(event, type) {
    event.preventDefault();
    let formData = new FormData(event.target);

    fetch(`${BACKEND_URL}/api/${type}`, {
        method: "POST",
        body: formData
    })
    .then(() => {
        fetchData(type);
        event.target.reset();
    })
    .catch(error => console.error(`Error adding ${type}:`, error));
}

// Edit Item
function editItem(type, id) {
    fetch(`${BACKEND_URL}/api/${type}/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("editId").value = id;
            document.getElementById("editType").value = type;
            document.getElementById("editName").value = data.name || "";
            if (type === "students") {
                document.getElementById("editAge").value = data.age || "";
                document.getElementById("editClass").value = data.className || "";
            } else if (type === "teachers") {
                document.getElementById("editSubject").value = data.subject || "";
            } else if (type === "classes") {
                document.getElementById("editClassName").value = data.className || "";
                document.getElementById("editStudents").value = data.students || 0;
            }
            document.getElementById("editSection").style.display = "block";
        })
        .catch(error => console.error(`Error fetching ${type} data for editing:`, error));
}

// Update Item
function updateItem(event) {
    event.preventDefault();
    let id = document.getElementById("editId").value;
    let type = document.getElementById("editType").value;
    let formData = new FormData(event.target);

    fetch(`${BACKEND_URL}/api/${type}/${id}`, {
        method: "PUT",
        body: formData
    })
    .then(response => response.json())
    .then(() => {
        fetchData(type);
        document.getElementById("editSection").style.display = "none";
    })
    .catch(error => console.error(`Error updating ${type}:`, error));
}

// Delete Item
function deleteItem(type, id) {
    fetch(`${BACKEND_URL}/api/${type}/${id}`, { method: "DELETE" })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to delete ${type}: ${response.statusText}`);
        }
        return response;
    })
    .then(() => fetchData(type))
    .catch(error => console.error(`Error deleting ${type}:`, error));
}
