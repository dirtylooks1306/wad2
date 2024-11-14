<script setup>
import { ref, onMounted } from "vue";
import {
	db,
	collection,
	getDocs,
	deleteDoc,
	doc,
	updateDoc,
} from "../firebaseConfig.js";
import AdminNavBar from "../components/AdminNavBar.vue";
// State for storing users
const users = ref([]);

// Fetch all users
const fetchUsers = async () => {
	const usersCollection = collection(db, "users");
	const querySnapshot = await getDocs(usersCollection);
	users.value = querySnapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));
};

// Delete a user
const deleteUser = async (userId) => {
	try {
		await deleteDoc(doc(db, "users", userId));
		users.value = users.value.filter((user) => user.id !== userId);
	} catch (error) {
		console.error("Error deleting user:", error);
	}
};

// Toggle user role between 'admin' and 'user'
const toggleUserRole = async (user) => {
	const newRole = user.role === "admin" ? "user" : "admin";
	try {
		await updateDoc(doc(db, "users", user.id), { role: newRole });
		user.role = newRole; // Update locally
	} catch (error) {
		console.error("Error updating user role:", error);
	}
};

// Fetch users on component mount
onMounted(fetchUsers);
</script>

<template>
	<AdminNavBar />
	<div>
		<h1 class="text-center title">User Management</h1>
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Username</th>
						<th>Email</th>
						<th>Role</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="user in users" :key="user.id">
						<td>{{ user.username }}</td>
						<td>{{ user.email }}</td>
						<td>{{ user.role }}</td>
						<td>
							<button @click="toggleUserRole(user)">
								{{
									user.role === "admin"
										? "Demote to User"
										: "Promote to Admin"
								}}
							</button>
							<button @click="deleteUser(user.id)">Delete</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<style scoped>
.title{
    text-align: center;
    font-size: 36px;
    color: #ff9689;
    font-family: "Cherry Bomb", sans-serif;
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin: 0 auto;
    padding: 20px;
    max-width: 1200px;
}

.table-container {
	display: flex;
	justify-content: center;
	overflow-x:auto
	
}

table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 20px;
	overflow: hidden;
}

th,
td {
	padding: 10px;
	border: 1px solid #ddd;
	text-align: left;
}

th {
	background-color: #f4f4f4;
	font-weight: bold;
}

button {
	margin-right: 8px;
	padding: 6px 12px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

button:first-of-type {
	background-color: #4caf50;
	color: white;
}

button:last-of-type {
	background-color: #f44336;
	color: white;
}

button:hover {
	opacity: 0.9;
}
/* Table container styling */
table {
	width: 90%;
	border-collapse: collapse;
	margin-top: 20px;
	background-color: #fff;
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
	border-radius: 8px;
	overflow: hidden;
}

/* Header row styling */
thead th {
	background-color: #ff9689;
	color: white;
	font-weight: bold;
	font-size: 16px;
	padding: 12px;
	text-align: left;
	text-transform: uppercase;
}

/* Table body row styling */
tbody tr {
	transition: background-color 0.3s ease;
}

tbody tr:nth-child(even) {
	background-color: #f9f9f9;
}

tbody tr:hover {
	background-color: #f1f1f1;
}

/* Cell styling */
th,
td {
	padding: 12px;
	border-bottom: 1px solid #ddd;
}

/* Primary button styling */
button {
	padding: 8px 16px;
	margin-right: 8px;
	border: none;
	border-radius: 4px;
	font-weight: bold;
	cursor: pointer;
	transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Promote/Demote button */
button:first-of-type {
	background-color: #4caf50;
	color: white;
}

button:first-of-type:hover {
	background-color: #45a049;
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

/* Delete button */
button:last-of-type {
	background-color: #f44336;
	color: white;
}

button:last-of-type:hover {
	background-color: #d32f2f;
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

/* Button hover effect for slight opacity change */
button:hover {
	opacity: 0.95;
}

@media (max-width: 768px) {
	.table-container{
		overflow-x: scroll;
		align-items: center;
	}
	th, td {
	padding: 0px;
	font-size: 0.75em;
	max-width: min-content;
	text-align: center
	}

	thead th{
		font-size: 0.75em;
		max-width: min-content;
		text-align: center
	}

	table {
	min-width: 100%; 
	margin-left: 40px;
	margin-right:10px;
	}


	button {
	/* padding: 8px 10px; */
	font-size: 0.85em;
	width: 70%;
	margin-top: 5px;
	}


	.title {
	font-size: 1.5em;
	margin-bottom: 15px;
	}
}
</style>
