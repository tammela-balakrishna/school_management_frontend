document.addEventListener("DOMContentLoaded", function () {
    showSection("students"); // Show Students section by default

    document.getElementById("studentForm")?.addEventListener("submit", addStudent);
    document.getElementById("teacherForm")?.addEventListener("submit", addTeacher);
    document.getElementById("classForm")?.addEventListener("submit", addClass);
});

function showSection(section) {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
    document.getElementById(`${section}Section`).style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    ["students", "teachers", "classes"].forEach(fetchData);
});

function fetchData(type) {
    fetch(`https://school-management-backend-1-ugbc.onrender.com/api/${type}`)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error(`${type} data is not an array`);
            }
            populateTable(type, data);
        })
        .catch(error => console.error(`Error fetching ${type}:`, error));
}

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
        } else {
            row.innerHTML = `
                <td>
                    <img src="${item.image ? `https://school-management-backend-1-ugbc.onrender.com${item.image}` : 'https://school-management-backend-1-ugbc.onrender.com/default-placeholder.png'}" 
                         alt="${item.name}" width="50" height="50">
                </td>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${type === "students" ? item.age || "N/A" : item.subject || "N/A"}</td>
                <td>
                    <button onclick="editItem('${type}', ${item.id})">Edit</button>
                    <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
                </td>
            `;
        }
        tableBody.appendChild(row);
    });
}

function addStudent(event) {
    event.preventDefault();
    let formData = new FormData();
    formData.append("image", document.getElementById("studentImage").files[0]);
    formData.append("name", document.getElementById("studentName").value);
    formData.append("age", document.getElementById("studentAge").value);
    formData.append("className", document.getElementById("studentClass").value);

    fetch("https://school-management-backend-1-ugbc.onrender.com/api/students", {
        method: "POST",
        body: formData
    })
    .then(() => fetchData("students"))
    .catch(error => console.error("Error adding student:", error));
}

function deleteItem(type, id) {
    fetch(`https://school-management-backend-1-ugbc.onrender.com/api/${type}/${id}`, { method: "DELETE" })
    .then(() => fetchData(type))
    .catch(error => console.error(`Error deleting ${type}:`, error));
}
