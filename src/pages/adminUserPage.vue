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
		<h1 class="text-center">User Management</h1>
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
.table-container {
	display: flex;
	justify-content: center;
	margin-top: 20px;
}

table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 20px;
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
</style>
