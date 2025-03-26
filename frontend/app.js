document.addEventListener("DOMContentLoaded", function () {
    showSection("students"); 
    ["students", "teachers", "classes"].forEach(fetchData);

    document.getElementById("studentForm").addEventListener("submit", event => addEntry(event, "students"));
    document.getElementById("teacherForm").addEventListener("submit", event => addEntry(event, "teachers"));
    document.getElementById("classForm").addEventListener("submit", event => addEntry(event, "classes"));
    document.getElementById("editForm").addEventListener("submit", updateItem);
});

const BACKEND_URL = "https://school-management-backend-1-ugbc.onrender.com";

function showSection(section) {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
    document.getElementById(`${section}Section`).style.display = "block";
}

function fetchData(type) {
    fetch(`${BACKEND_URL}/api/${type}`)
        .then(response => response.json())
        .then(data => populateTable(type, data))
        .catch(error => console.error(`Error fetching ${type}:`, error));
}

function populateTable(type, data) {
    const tableBody = document.getElementById(`${type}TableBody`);
    tableBody.innerHTML = "";
    
    data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.className || "N/A"}</td>
            <td>${item.students || "N/A"}</td>
            <td>
                <button onclick="editItem('${type}', ${item.id})">Edit</button>
                <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addEntry(event, type) {
    event.preventDefault();
    let formData = new FormData(event.target);

    fetch(`${BACKEND_URL}/api/${type}`, { method: "POST", body: formData })
        .then(() => { fetchData(type); event.target.reset(); })
        .catch(error => console.error(`Error adding ${type}:`, error));
}

function editItem(type, id) {
    fetch(`${BACKEND_URL}/api/${type}/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("editId").value = id;
            document.getElementById("editType").value = type;
            document.getElementById("editName").value = data.name || "";
            document.getElementById("editAge").value = data.age || "";
            document.getElementById("editClass").value = data.className || "";
            document.getElementById("editSubject").value = data.subject || "";
            document.getElementById("editSection").style.display = "block";
        });
}

function updateItem(event) {
    event.preventDefault();
    let id = document.getElementById("editId").value;
    let type = document.getElementById("editType").value;
    let formData = new FormData(event.target);

    fetch(`${BACKEND_URL}/api/${type}/${id}`, { method: "PUT", body: formData })
        .then(() => { fetchData(type); document.getElementById("editSection").style.display = "none"; });
}

function deleteItem(type, id) {
    fetch(`${BACKEND_URL}/api/${type}/${id}`, { method: "DELETE" })
        .then(() => fetchData(type));
}
