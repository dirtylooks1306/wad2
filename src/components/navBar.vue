<template>
	<nav class="navbar navbar-expand-lg bg-body-tertiary">
		<div class="container-fluid">
			<router-link to="/" class="navbar-brand">
				<div class="logo-container">
					<img
						src="../assets/icons/ccLogo.png"
						class="nav-logo"
						alt="Logo"
					/>
					<img
						src="../assets/icons/cctextLogo.png"
						class="nav-logo text-logo"
						alt="CradleCare"
					/>
				</div>
			</router-link>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon"></span>
			</button>

			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item">
						<router-link
							to="/diary"
							class="nav-link"
							:class="{ 'active-item': route.path === '/diary' }"
							>Diary</router-link
						>
					</li>
					<li
						class="nav-item dropdown"
						:class="{ active: isExploreActive }"
					>
						<a
							class="nav-link dropdown-toggle"
							href="#"
							role="button"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							Explore articles
						</a>
						<ul class="dropdown-menu ">
							<li>
								<router-link
									class="dropdown-item"
									:class="{
										'active-item': activeCategory === 'new',
									}"
									to="/articles/new"
									>New!</router-link
								>
							</li>
							<li>
								<router-link
									class="dropdown-item"
									:class="{
										'active-item':
											activeCategory === 'activities',
									}"
									to="/articles/activities"
									>Activities</router-link
								>
							</li>
							<li>
								<router-link
									class="dropdown-item"
									:class="{
										'active-item':
											activeCategory === 'education',
									}"
									to="/articles/education"
									>Education</router-link
								>
							</li>
							<li>
								<router-link
									class="dropdown-item"
									:class="{
										'active-item':
											activeCategory === 'nutrition',
									}"
									to="/articles/nutrition"
									>Nutrition</router-link
								>
							</li>

							<!-- Clear, visible partition line -->
							<li><div class="custom-divider"></div></li>

							<!-- Updated 'Favourite' to 'Saved' -->
							<li>
								<router-link
									class="dropdown-item"
									:class="{
										'active-item':
											activeCategory === 'saved',
									}"
									to="/articles/saved"
								>
									Saved
								</router-link>
							</li>
						</ul>
					</li>
					<li class="nav-item">
						<router-link
							to="/forum"
							class="nav-link"
							:class="{ 'active-item': route.path === '/forum' }"
							>Forum</router-link
						>
					</li>
					<li
						class="nav-item dropdown"
						:class="{ active: isTrackerActive }"
					>
						<a
							class="nav-link dropdown-toggle"
							href="#"
							role="button"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							Explore trackers
						</a>
						<ul class="dropdown-menu ">
							<li>
								<router-link
									to="/growthtracker"
									class="nav-link"
									:class="{
										'active-item':
											route.path === '/growthtracker',
									}"
									>GrowthTracker</router-link
								>
							</li>
							<li>
								<router-link
									to="/vaccinetracker"
									class="nav-link"
									:class="{
										'active-item':
											route.path === '/vaccinetracker',
									}"
									>Vaccine Tracker</router-link
								>
							</li>
						</ul>
					</li>
					<li class="nav-item">
						<router-link
							to="/emergency"
							class="nav-link"
							:class="{
								'active-item': route.path === '/emergency',
							}"
							>Emergency</router-link
						>
					</li>
					<li class="nav-item d-lg-none" v-if="!user">
						<router-link to="/login" class="nav-link login-register"
							>Login/Register</router-link
						>
					</li>
					<li class="nav-item d-lg-none" v-else>
						<!-- <router-link to="/profile" class="nav-link">
							<img
								src="../assets/icons/profile.png"
								class="profile-icon"
							/>
						</router-link> -->
					</li>
				</ul>
			</div>

			<div class="d-flex ms-auto align-items-center">
				<div class="d-flex align-items-center dropdown me-3 position-relative">
					<font-awesome-icon
						:icon="['fas', 'bell']"
						class="notification-bell"
						id="notificationDropdown"
						data-bs-toggle="dropdown"
						aria-expanded="false"
						@click="handleNotificationTabClick"
					/>
					<span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>

					<div class="dropdown-menu dropdown-menu-end p-3" aria-labelledby="notificationDropdown">
						<p class="mb-2 fw-bold">You have {{ notificationCount }} new notifications.</p>
						
						<ul v-if="notifications.length > 0" class="notification-list ">
							<li v-for="notification in notifications" :key="notification.eventId" class="notification-item mb-2 p-2">
								{{ notification.message }}
							</li>
						</ul>

						<p v-else class="text-muted">No new notifications at this time.</p>

						<!-- Style for the 'Mark all as read' button to make it more prominent -->
						<button v-if="notifications.length > 0" class="btn btn-sm btn-primary mt-2" @click="clearNotifications">Mark all as read</button>
					</div>
				</div>



				<!-- Login/Register or Profile Image -->
				<router-link
					v-if="!user"
					to="/login"
					class="nav-link login-register"
					:class="{
						'active-item':
							route.path === '/login' ||
							route.path === '/register',
					}"
				>
					Login/Register
				</router-link>

				<div v-else class="d-flex align-items-center position-relative">
					<div class="dropdown">
						<router-link
							to="/profile"
							class="nav-link"
							id="profileDropdown"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							<img :src="profileImage" class="profile-icon" />
						</router-link>
						<ul
							class="dropdown-menu dropdown-menu-end profile"
							aria-labelledby="profileDropdown"
						>
							<li>
								<router-link to="/profile" class="dropdown-item"
									>Profile</router-link
								>
							</li>
							<li>
								<button
									class="dropdown-item"
									@click="handleLogout"
								>
									Logout
								</button>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<div id="belownavBar"></div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { auth, signOut, doc, getDoc, db, getDocs, collection, query, where, writeBatch } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { useIntervalFn } from "@vueuse/core";

library.add(faBell);
const profileImage = ref("");
const route = useRoute();
const router = useRouter();
const user = ref(null);
const children = ref([]);
const notificationCount = ref(0); // Count of events within 24 hours
const notifications = ref([]); // Store upcoming events for display
const events = ref([]);
const dismissedNotifications = new Set();
const isDropdownOpen = ref(false);

const isExploreActive = computed(
	() => route.path.startsWith("/articles") || route.path === "/saved"
);
const isTrackerActive = computed(
	() =>
		route.path.startsWith("/growthtracker") ||
		route.path.startsWith("/vaccinetracker")
);
const activeCategory = computed(() => route.params.category || "");

const handleLogout = async () => {
	try {
		await signOut(auth);
		user.value = null; // Clear the user data
		router.push("/login"); // Redirect to the login page after logging out
	} catch (error) {
		console.error("Error logging out:", error);
	}
};
const fetchUserData = async () => {
	onAuthStateChanged(auth, async (currentUser) => {
		if (currentUser) {
			// Get the user's document reference
			
			const userDocRef = doc(db, "users", currentUser.uid);

			// Fetch the user document
			const userSnapshot = await getDoc(userDocRef);

			if (userSnapshot.exists()) {
				// Retrieve the profile image URL from the user document
				profileImage.value = userSnapshot.data().profileimage;
			} else {
				console.log("No user document found");
			}
		}
	});
};

const fetchAndMonitorEvents = async () => {
	onAuthStateChanged(auth, async (currentUser) => {
		if (currentUser) {
			const childrenRef = collection(db, "users", currentUser.uid, "children");
			const snapshot = await getDocs(childrenRef);
			children.value = snapshot.docs.map((doc) => doc.id);
			const currentTime = new Date();

			notifications.value = [];
			notificationCount.value = 0;
			events.value = [];
			const months = [
				"January",  
				"February", 
				"March",    
				"April",    
				"May",      
				"June",     
				"July",     
				"August",   
				"September",
				"October",   
				"November",  
				"December"   
			];

			for (let i = 0; i < children.value.length; i++) {
				// Query to get events that are undismissed and in the future
				const eventsRef = collection(db, "users", currentUser.uid, "children", children.value[i], "events");
				const eventsQuery = query(eventsRef, where("dismissed", "==", false));

				const eventsSnapshot = await getDocs(eventsQuery);
				eventsSnapshot.forEach((doc) => {
					const eventData = doc.data();
					const eventDate = new Date(eventData.start); 

					if (eventDate > currentTime) {
						events.value.push({
							childId: children.value[i],
							...eventData,
							eventId: doc.id
						});
					}
				});
			}
			// Check for events within the next 24 hours
			events.value.forEach((event) => {
				const eventDate = new Date(event.start);
				const timeDifference = eventDate - currentTime;
				let x = eventDate.getDate()
				if (timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000) {
					notifications.value.push({
						message: `You have an appointment at ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} for ${event.title}.`,
						eventId: event.eventId,
						timeRemaining: Math.floor(timeDifference / (60 * 60 * 1000)), // Hours remaining
						childId: event.childId,
					});
					notificationCount.value += 1;
				}
				//check events for in 1 wk
				if (timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000 * 7) {
					notifications.value.push({
						message: `You have an appointment at ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${eventDate.getDate()} ${months[eventDate.getMonth()]} for ${event.title}.`,
						eventId: event.eventId,
						timeRemaining: Math.floor(timeDifference / (60 * 60 * 1000)), // Hours remaining
						childId: event.childId,
					});
					notificationCount.value += 1;
				}
			});
		}
	});
};

const clearNotifications = async () => {
	const currentUser = auth.currentUser;
	if (currentUser) {
		const batch = writeBatch(db);
		notifications.value.forEach((notification) => {
			const eventRef = doc(db, "users", currentUser.uid, "children", notification.childId, "events", notification.eventId);
			batch.update(eventRef, { dismissed: true }); // Update dismissed status to true
		});

		await batch.commit(); 

		notifications.value = [];
		notificationCount.value = 0;
	}
};

const handleNotificationTabClick = () => {
	isDropdownOpen.value = !isDropdownOpen.value;
};

const { pause, resume } = useIntervalFn(fetchAndMonitorEvents, 30 * 60 * 1000, { immediate: true });


onMounted(() => {
	fetchUserData();
	resume();
	fetchAndMonitorEvents();
	onAuthStateChanged(auth, (currentUser) => {
		user.value = currentUser;
		
	});
});
</script>

<style scoped>


li{
	font-family: "Cherry Bomb", sans-serif;
}
#belownavBar {
	height: 80px;
}

.navbar {
	background-color: #ff9689 !important;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 1000;
}


.nav-logo {
	max-height: 50px;
	height: auto;
	width: auto;
}

.profile-icon {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
	border: 2px solid #fff;
	box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.logo-container {
	display: flex;
	align-items: center;
	justify-content: center;
}

.navbar-brand {
	display: flex;
	align-items: center;
}

.navbar-toggler {
	border: none;
}



.active-item {
	font-weight: bold;
	text-decoration: underline;
}

.active > .nav-link {
	text-decoration: underline;
	font-weight: bold;
}

.login-register {
	text-decoration: none;
	color: #000;
	margin-left: 10px;
	transition: color 0.3s;
}

.login-register:hover {
	color: #555;
}

@media (max-width: 992px) {
/* Ensure dropdown is below the button */
.dropdown-menu {
  position: absolute; 
  left: 0; 
  top: 100%; 
  margin-top: 0.5rem; 
  width:10%;
  max-height: 300px; 
  opacity: 1;
}

}
@media (max-width: 440px) {
	.text-logo {
		display: none;
	}
}

.custom-divider {
	height: 1px;
	background-color: #000;
	width: 100%;
	margin: 0;
}

.notification-bell {
	font-size: 1.5rem; 
	cursor: pointer;
	color: #333; 
	position: relative;
	padding: 20px;
}

.notification-badge {
	position: absolute;
	top: -5px;
	right: -5px;
	background-color: #ff3b3b;
	color: white;
	font-size: 0.7rem;
	padding: 2px 6px;
	border-radius: 50%;
	font-weight: bold;
}

/* Notification Badge */
.notification-badge {
    background-color: #dc3545; /* Red badge for visibility */
    color: white;
    border-radius: 50%;
    padding: 2px 8px;
    font-size: 0.75rem;
    position: absolute;
    top: 8px;
    right: 8px;
}

/* Notification Dropdown */
.dropdown-menu {
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	background-color: #fbf4eb !important;
}
.dropdown-menu-end{
	width:250px;
	right:0;
	left:auto;
} 
.profile{
	width: 150px !important;
}
/* Notification List Styling */
.notification-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

/* Notification Item Styling */
.notification-item {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    transition: background-color 0.3s;
	font-family: "Segoe UI", Arial, sans-serif;
}

.notification-item:hover {
    background-color: #e9ecef;
    cursor: pointer;
}

/* 'Mark all as read' Button Styling */
.btn-link {
    color: #007bff;
    text-decoration: none;
}

.btn-link:hover {
    text-decoration: underline;
}

.btn-primary {
    font-weight: 500;
    font-size: 0.875rem;
}

</style>