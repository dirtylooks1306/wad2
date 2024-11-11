<template>
  <NavBar />
  <div class="forum-home-container">
    <div class="forum-layout">
      <!-- Left Sidebar -->
      <ForumSidebar />

      <!-- Main Content Area -->
      <div class="forum-content">
        <div class="forum-cards-container">
          <div v-for="forumPost in forumPosts" :key="forumPost.id" class="forum-card-wrapper">
            <ForumCard :post="forumPost" />
            <hr />
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <!-- <ForumRightbar v-show="isSidebarVisible" /> -->
    </div>
  </div>
  <ToTop />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { db, collection, doc, getDoc, getDocs, query, orderBy, limit, where, auth } from '../firebaseConfig.js';
import NavBar from "../components/navBar.vue";
import ForumSidebar from '../components/forumsideBar.vue';
import ForumRightbar from '../components/forumRightbar.vue';
import ForumCard from '../components/forumCard.vue';
import ToTop from '../components/ToTop.vue';
 
const route = useRoute();
const forumPosts = ref([]);
const isSidebarVisible = ref(true); // State to control sidebar visibility

// Fetch saved post IDs from the user's document and retrieve corresponding posts
const fetchSavedPosts = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not logged in");
      return [];
    }

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const savedPosts = userDoc.data().savedPosts || []; 
      const savedPostsQuery = query(collection(db, 'forum'), where('__name__', 'in', savedPosts));
      const savedPostsSnapshot = await getDocs(savedPostsQuery);

      return savedPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      console.error("User document not found");
      return [];
    }
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }
};

// Fetch recently viewed post IDs from the user's document and retrieve corresponding posts
const fetchRecentlyViewedPosts = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not logged in");
      return [];
    }

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const recentlyViewed = userDoc.data().recentlyViewed || []; 
      const recentlyViewedQuery = query(collection(db, 'forum'), where('__name__', 'in', recentlyViewed));
      const recentlyViewedSnapshot = await getDocs(recentlyViewedQuery);

      return recentlyViewedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      console.error("User document not found");
      return [];
    }
  } catch (error) {
    console.error("Error fetching recently viewed posts:", error);
    return [];
  }
};

const fetchPostsByCategory = async (category) => {
  try {
    const forumCollection = collection(db, 'forum');
    let postsData = [];

    if (category === 'trending') {
      const forumQuery = query(forumCollection, orderBy('likes', 'desc'), limit(50));
      const querySnapshot = await getDocs(forumQuery);
      postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else if (category === 'new') {
      const forumQuery = query(forumCollection, orderBy('date', 'desc'), limit(50));
      const querySnapshot = await getDocs(forumQuery);
      postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else if (category === 'saved') {
      postsData = await fetchSavedPosts();
    } else if (category === 'recently-viewed') {
      postsData = await fetchRecentlyViewedPosts();
    }

    forumPosts.value = postsData;
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

// Watch the route for changes and fetch posts accordingly
watch(
  () => route.path,
  () => {
    const categories = ['trending', 'new', 'saved', 'recently-viewed'];
    const currentCategory = categories.find(category => route.path.includes(category)) || 'trending';
    fetchPostsByCategory(currentCategory);
  },
  { immediate: true }
);

onMounted(() => {
  const categories = ['trending', 'new', 'saved', 'recently-viewed'];
  const currentCategory = categories.find(category => route.path.includes(category)) || 'trending';
  fetchPostsByCategory(currentCategory);

  // Intersection Observer to hide sidebar when it touches the content area
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (window.innerWidth > 767) { // Only trigger on larger screens
        isSidebarVisible.value = !entry.isIntersecting;
      } else {
        isSidebarVisible.value = false;
      }
    },
    { threshold: 0.1 }
  );

});
</script>

<style scoped>
.forum-home-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center align everything on small screens */
}

.forum-layout {
  display: flex;
  width: 100%; /* Ensure it takes full width */
  max-width: 1200px; /* Add max-width for larger screens */
  margin: 0 auto; /* Center align the layout on larger screens */
}

.forum-cards-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
}

.forum-card-wrapper {
  width: 100%;
  margin-bottom: 20px;
}

.right-sidebar {
  width: 250px;
  background-color: #f7f7f7;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-left: 10px;
  transition: opacity 0.3s;
}

.right-sidebar.hidden {
  opacity: 0;
  pointer-events: none;
}




.forum-home-container {
  display: flex;
  flex-direction: column;
}

.forum-layout {
  display: flex;
}

.forum-cards-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.forum-card-wrapper {
  width: 100%;
  margin-bottom: 20px;
}

.right-sidebar {
  width: 250px;
  background-color: #f7f7f7;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-left: 10px;
  transition: opacity 0.3s;
}

.right-sidebar.hidden {
  opacity: 0;
  pointer-events: none;
}

.forum-home-container {
  display: flex;
  flex-direction: column;
}

.forum-layout {
  display: flex;
  justify-content: center; /* Center align the forum cards */
  margin-right: 270px; /* Create space for the fixed right sidebar */
}

.forum-content {
  flex-grow: 1;
  padding: 20px;
  border-radius: 8px;
  margin-left: 280px; /* Adjust for left sidebar */
}
@media (max-width: 778px){
  .forum-content {
  flex-grow: 1;
  padding: 20px;
  border-radius: 8px;
  margin-left: 80px; /* Adjust for left sidebar */
  margin-right: 10px;
}
}
.forum-cards-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.forum-card-wrapper {
  width: 100%;
  margin-bottom: 20px;
}

@media (max-width: 1024px) {
  .forum-layout {
    margin-right: 0; /* Remove right margin on smaller screens */
  }

  .right-sidebar {
    display: none; /* Hide right sidebar on small screens */
  }
}

</style>
