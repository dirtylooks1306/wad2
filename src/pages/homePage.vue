<template>
  <NavBar />
  <header>
    <div class="jumbotron header_class">
      <div class="row">
        <div class="col-md-6 header col-12">
          <div class="title-class text-container">
            <span class="line-1">Empowering Parents</span>
            <span class="line-2">Nurturing Futures</span>
          </div>
          <router-link to="/diary">
            <button class="btn btn-primary read-more-button mb-3">Get Started</button>
          </router-link>
        </div>

        <div class="col-md-6 col-12">
          <img src="../assets/HomeMasthead.svg" alt="baby" />
        </div>
      </div>
    </div>
  </header>
  
  <div class="secondary-background p-3">
    <div class="container-fluid">
      <CustomHeader header="Article" />
      <h2 class="text-center">TRENDING ARTICLES</h2>
      <Carousel :items="carouselItems" @item-click="goToArticleDetails" />
    </div>
  </div>
  <div class="container-fluid p-3">
    <CustomHeader header="GrowthTracker" />
    <div class="row align-items-center">
      <div class="col-md-1"></div>
      
      <div class="col-md-5 text-start mt-3 d-flex flex-column justify-content-between carousel-content">
        <div>
          <h3 class="carousel-title">Begin Your Little One's Journey to Healthy Growth!</h3>
          <hr class="title-divider" />
          <p>Stay informed and engaged—check out the Growth Tracker to celebrate every milestone!</p>
        </div>
        
        <!-- "Read More" button positioned at the bottom -->
        <router-link to="/growthtracker">
          <button class="btn btn-primary read-more-button">GrowthTracker</button>
        </router-link>
      </div>

      <div class="col-md-5 d-flex justify-content-center align-items-center">
        <img src="../assets/homepageBaby.jpg" class="d-block p-3 carousel-image" />
      </div>
      
      <div class="col-md-1"></div>
    </div>
  </div>
  <div class="container-fluid secondary-background p-3">
    <CustomHeader header="Vaccine Tracker" />
    <div class="row align-items-center">
      <div class="col-md-1"></div>
      <div class="col-md-5 d-flex justify-content-center align-items-center">
        <img src="../assets/calender-homepage.jpg" class="d-block p-3 carousel-image" />
      </div>
      <div class="col-md-5 text-start mt-3 d-flex flex-column justify-content-between carousel-content">
        <div>
          <h3 class="carousel-title">Your Baby's Vaccine Schedule, Simplified</h3>
          <hr class="title-divider" />
          <p>Stay on track with your baby's vaccinations—never miss a dose!</p>
        </div>
        
        <router-link to="/vaccinetracker">
          <button class="btn btn-primary read-more-button">Vaccine Tracker</button>
        </router-link>
      </div>
      
      <div class="col-md-1"></div>
    </div>
  </div>

  <!-- Remaining sections unchanged -->

  <footer class="footer">
    <hr class="footer-divider">
    <p class="footer-text">CradleCare © 2024</p>
  </footer>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { db } from "../firebaseConfig.js";  // Import Firestore instance
import CustomHeader from "../components/CustomHeader.vue";
import Carousel from "../components/Carousel.vue";
import NavBar from "../components/navBar.vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const carouselItems = ref([]);

// Function to fetch top 3 articles by Likes
const fetchTopArticles = async () => {
  try {
    const articlesCollection = collection(db, "articles");
    const q = query(articlesCollection, orderBy("Likes", "desc"), limit(3));
    const querySnapshot = await getDocs(q);

    carouselItems.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().Title || "Untitled",
      description: doc.data().Description || "No description available.",
      image: doc.data().ImageUrl || null, // Use ImageUrl or fallback to null
      alt: doc.data().Alt || "Article Image", 
      icon1: "src/assets/heart.svg", 
      icon2: "src/assets/bookmark.svg"
    }));
  } catch (error) {
    console.error("Error fetching top articles:", error.message);
  }
};

// Fetch top articles on component mount
onMounted(fetchTopArticles);

// Function to navigate to the article details page
const goToArticleDetails = (itemId) => {
  router.push({ name: 'ArticleDetails', params: { id: itemId } });
};
</script>

<style scoped>
/* Jumbotron / Header */
.jumbotron {
  background-color: #f9f3f3;
  padding: 20px 0px ;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header_class .row {
  display: flex;
  align-items: center;
}

.header .title-class {
  font-family: "Cherry Bomb", sans-serif;
  color: #ff9689;
  text-align: right;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.header .line-1,
.header .line-2 {
  display: block;
  font-size: 2.5rem;
}
.secondary-background {
  background-color: #eed4d4;
  width: 100%;
  /* display: flex; */
}

h2{
  font-family: "Cherry Bomb", sans-serif;
  color: #ff9689;
}


.header .btn-primary:hover {
  transform: translateY(-2px);
}

/* Column adjustments for better alignment */
.col-md-6.header {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
}

.col-md-6 img {
  max-width: 100%;
  border-radius: 8px;
}
.carousel-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.carousel-image {
  width: 100%;
  max-width: 500px !important;
  height: auto;
}
.carousel-title {
    font-family: "Cherry Bomb", sans-serif;
    font-size: 24px;
    color: #ff9689;
    text-align: left;
    margin-bottom: 10px;
}
.title-divider {
    border-top: 4px solid #ff9689;
    margin-bottom: 15px;
}
.read-more-button {
    font-family: "Cherry Bomb", sans-serif;
    font-size: 16px;
    color: #fff;
    align-self: flex-start;
    margin-top: auto;
}
.footer {
  padding: 20px;
  text-align: center;
}

.footer-divider {
  width: 80%; 
  margin: 0 auto 10px auto; 
  border: 0;
  border-top: 2px solid #ff9689; 
}

.footer-text {
  font-family: "Cherry Bomb", sans-serif;
  color: #555;
  font-size: 1rem;
  margin: 0;
}




@media (max-width: 768px) {
  .header {
    align-items: flex-start; /* Align items to the left */
    padding-left: 20px; /* Adjust to move content further left on small screens */
  }

  .text-container, .line-1, .line-2 {
    text-align: left;
  }

  .read-more-button {
    align-self: flex-start; /* Aligns button with text */
  }
  .col-md-6.header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

  .carousel-image {
    max-width: 200px;
  }
}
img {
  object-fit: cover; 
  border-radius: 8px;
}
</style>
