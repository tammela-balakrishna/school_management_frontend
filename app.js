
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

function fetchData(type) {
    fetch(`http://localhost:5000/api/${type}`)
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

            // Store data in global variables
            if (type === "students") students = data;
            else if (type === "teachers") teachers = data;
            else if (type === "classes") classes = data;

            populateTable(type, data);
        })
        .catch(error => console.error(`Error fetching ${type}:`, error));
}
// Populate tables dynamically
function populateTable(type, data) {
    const tableBody = document.getElementById(`${type}TableBody`);
    tableBody.innerHTML = ""; // Clear previous entries

    data.forEach((item, index) => {
        const row = document.createElement("tr");

        if (type === "classes") {
            // Class Management Table
            row.innerHTML = `
                <td>${index + 1}</td>  <!-- Serial Number -->
                <td>${item.className || "N/A"}</td>
                <td>${item.students !== undefined ? item.students : "N/A"}</td>
                <td>
                    <button onclick="editItem('${type}', ${item.id})">Edit</button>
                    <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
                </td>
            `;
        } else if (type === "students") {
            // Student Management Table (Matching Columns)
            row.innerHTML = `
                <td>
                    <img src="${item.image ? `http://localhost:5000${item.image}` : 'http://localhost:5000/default-placeholder.png'}" 
                         alt="${item.name}" width="50" height="50">
                </td>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.age || "N/A"}</td>
                <td>${item.className || "N/A"}</td>
                <td>
                    <button onclick="editItem('${type}', ${item.id})">Edit</button>
                    <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
                </td>
            `;
        } else if (type === "teachers") {
            // Teacher Management Table (Matching Columns)
            row.innerHTML = `
                <td>
                    <img src="${item.image ? `http://localhost:5000${item.image}` : 'http://localhost:5000/default-placeholder.png'}" 
                         alt="${item.name}" width="50" height="50">
                </td>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.subject || "N/A"}</td>
                <td>
                    <button onclick="editItem('${type}', ${item.id})">Edit</button>
                    <button onclick="deleteItem('${type}', ${item.id})">Delete</button>
                </td>
            `;
        }

        tableBody.appendChild(row);
    });
}

// Add Student with Image
function addStudent(event) {
    event.preventDefault();
    let formData = new FormData();
    formData.append("image", document.getElementById("studentImage").files[0]); // Image
    formData.append("name", document.getElementById("studentName").value);
    formData.append("age", document.getElementById("studentAge").value);
    formData.append("className", document.getElementById("studentClass").value);

    fetch("http://localhost:5000/api/students", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Student added:", data);
        fetchData("students"); 
        document.getElementById("studentForm").reset();
    })
    .catch(error => console.error("Error adding student:", error));
}
// Add Teacher with Image
function addTeacher(event) {
    event.preventDefault();

    let formData = new FormData();
    formData.append("image", document.getElementById("teacherImage").files[0]);
    formData.append("name", document.getElementById("teacherName").value);
    formData.append("subject", document.getElementById("teacherSubject").value);

    fetch("http://localhost:5000/api/teachers", {
        method: "POST",
        body: formData
    })
    .then(() => {
        fetchData("teachers");
        document.getElementById("teacherForm").reset(); // Clear the form
    })
    .catch(error => console.error("Error adding teacher:", error));
}
// Add Class
function addClass(event) {
    event.preventDefault();

    let classStrength = {
        className: document.getElementById("className").value,
        students: parseInt(document.getElementById("classStudents").value) || 0
    };

    console.log("Sending class data:", classStrength);

    fetch("http://localhost:5000/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classStrength)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Added class:", data);
        fetchData("classes");
        document.getElementById("classForm").reset();

    })
    .catch(error => console.error("Error adding class:", error));
}

// Fetch and Edit Item
let editingId = null; // Store the ID of the item being edited
function editItem(type, id) {
    fetch(`http://localhost:5000/api/${type}/${id}`)
        .then(response => response.json())
        .then(data => {
            if (!data) {
                console.error(`${type} with ID ${id} not found.`);
                return;
            }

            document.getElementById("editId").value = id;
            document.getElementById("editType").value = type;

            // Hide all inputs initially
            document.getElementById("editImage").style.display = "none";
            document.getElementById("editStudentName").style.display = "none";
            document.getElementById("editStudentAge").style.display = "none";
            document.getElementById("editStudentClass").style.display = "none";
            document.getElementById("editTeacherName").style.display = "none";
            document.getElementById("editTeacherSubject").style.display = "none";
            document.getElementById("editClassName").style.display = "none";
            document.getElementById("editClassStudents").style.display = "none";

            if (type === "students") {
                document.getElementById("editImage").style.display = "block";
                document.getElementById("editStudentName").style.display = "block";
                document.getElementById("editStudentAge").style.display = "block";
                document.getElementById("editStudentClass").style.display = "block";

                document.getElementById("editStudentName").value = data.name || "";
                document.getElementById("editStudentAge").value = data.age || "";
                document.getElementById("editStudentClass").value = data.className || "";
            } 
            else if (type === "teachers") {
                document.getElementById("editImage").style.display = "block";
                document.getElementById("editTeacherName").style.display = "block";
                document.getElementById("editTeacherSubject").style.display = "block";

                document.getElementById("editTeacherName").value = data.name || "";
                document.getElementById("editTeacherSubject").value = data.subject || "";
            } 
            else if (type === "classes") {
                document.getElementById("editClassName").style.display = "block";
                document.getElementById("editClassStudents").style.display = "block";

                document.getElementById("editClassName").value = data.className || "";
                document.getElementById("editClassStudents").value = data.students || 0;
            }

            document.getElementById("editSection").style.display = "block";
        })
        .catch(error => console.error(`Error fetching ${type} data for editing:`, error));
}
// Close Edit Form
function closeEditForm() {
    document.getElementById("editSection").style.display = "none";
    editingId = null;
}
// Save Edited Item
function saveEdit(event) {
    event.preventDefault();
    let type = document.getElementById("editType").value;
    
    if (!editingId) {
        console.error("Editing ID is not set");
        return;
    }

    let formData = {
        name: document.getElementById("editName") ? document.getElementById("editName").value.trim() : ""
    };

    if (type === "students") {
        formData.age = document.getElementById("editAge") ? document.getElementById("editAge").value : "";
        formData.className = document.getElementById("editClass") ? document.getElementById("editClass").value.trim() : "";
    } 
    else if (type === "teachers") {
        formData.subject = document.getElementById("editSubject") ? document.getElementById("editSubject").value.trim() : "";
    } 
    else if (type === "classes") {  
        formData.className = document.getElementById("editClassName") ? document.getElementById("editClassName").value.trim() : "";
        formData.students = document.getElementById("editStudents") ? parseInt(document.getElementById("editStudents").value) || 0 : 0;
    }

    console.log("Updating:", type, "ID:", editingId, "Data:", formData); // Debugging

    fetch(`http://localhost:5000/api/${type}/${editingId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to update ${type}: ${response.statusText}`);
        return response.json();
    })
    .then(() => {
        fetchData(type); // Refresh data
        closeEditForm(); // Close edit form after saving
    })
    .catch(error => console.error(`Error updating ${type}:`, error));
}
// Close Edit Form
function closeEditForm() {
    document.getElementById("editSection").style.display = "none";
    editingId = null; // Reset editing ID
}
// Ensure editingId is set before updating
function updateItem(event) {
    event.preventDefault();
    let type = document.getElementById("editType").value;
    let id = document.getElementById("editId").value; // Ensure ID is captured

    if (!id) {
        alert("No item selected for update.");
        return;
    }

    let formData = {};

    if (type === "students") {
        formData = {
            name: document.getElementById("editStudentName").value.trim(),
            age: parseInt(document.getElementById("editStudentAge").value) || 0,
            className: document.getElementById("editStudentClass").value.trim()
        };
    } 
    else if (type === "teachers") {
        formData = {
            name: document.getElementById("editTeacherName").value.trim(),
            subject: document.getElementById("editTeacherSubject").value.trim()
        };
    } 
    else if (type === "classes") {
        let editClassName = document.getElementById("editClassName");
        let editStudents = document.getElementById("editClassStudents");

        if (!editClassName || !editStudents) {
            console.error("Edit fields not found in the DOM!");
            return;
        }

        formData = {
            className: editClassName.value.trim(),
            students: editStudents ? parseInt(editStudents.value) || 0 : 0
        };
    } 
    else {
        console.error("Invalid type:", type);
        return;
    }

    console.log("Updating:", type, "ID:", id, "Data:", formData); // Debugging

    fetch(`http://localhost:5000/api/${type}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update ${type}: ${response.statusText}`);
        }
        return response.json();
    })
    .then((updatedData) => {
        console.log("Updated successfully:", updatedData); // Debugging
        fetchData(type); // Refresh table data
        closeEditForm(); // Hide the edit form
    })
    .catch(error => console.error(`Error updating ${type}:`, error));
}
// Delete Item
function deleteItem(type, id) {
    fetch(`http://localhost:5000/api/${type}/${id}`, { method: "DELETE" })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to delete ${type}: ${response.statusText}`);
        }
        return response;
    })
    .then(() => fetchData(type)) // Refresh data after deletion
    .catch(error => console.error(`Error deleting ${type}:`, error));
}

