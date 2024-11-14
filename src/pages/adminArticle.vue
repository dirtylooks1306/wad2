<template>
  <AdminNavBar />
  <div>
    <h1 class="text-center mt-1 title">Articles Management</h1>
    <div class="header-container">
      <div class="spacer"></div>
      <div class="pagination-controls-center">
        <CustomHeader header="Articles Per Page:" />
        <select v-model="itemsPerPage" @change="updateItemsPerPage">
          <option value="5">5</option>
          <option value="10">10</option>
        </select>
      </div>
      <button @click="showArticleForm = true" class="add-article-button ">Add Article</button>
    </div>

    <!-- Article Form (Modal) -->
    <div v-if="showArticleForm" class="modal-overlay" @click.self="closeArticleForm">
      <div class="modal-content">
        <h2>Add New Article</h2>
        <form @submit.prevent="publishArticle">
          <label>Title</label>
          <input v-model="newArticle.Title" type="text" required />

          <label>Author</label>
          <input v-model="newArticle.Author" type="text" required />

          <div class="form-group">
                <label for="category" class="form-label">Category</label>
                <select id="categoryNew" v-model="newArticle.Category" required class="form-select full-width">
                    <option disabled value="">Select Category</option>
                    <option>Activities</option>
                    <option>Education</option>
                    <option>Nutrition</option>
                </select>
            </div>

          <label>Description</label>
          <textarea v-model="newArticle.Description" placeholder="Enter article description" required></textarea>

          <label>Content</label>
          <textarea v-model="newArticle.Content" placeholder="Enter article content" required></textarea>

          <!-- Image Upload for Article -->
          <label>Upload Article Image</label>
          <input type="file" @change="handleImageUpload" accept="image/*" />

          <button type="submit">Publish Article</button>
          <button type="button" @click="closeArticleForm">Cancel</button>
        </form>
      </div>
    </div>

    <!-- Articles Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in paginatedArticles" :key="article.id">
            <td>{{ article.Title }}</td>
            <td>{{ article.Author }}</td>
            <td>{{ article.Category }}</td>
            <td>
              <button @click="openEditModal(article)">Edit</button>
              <button @click="deleteArticle(article.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Navigation -->
    <div class="pagination-navigation">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
    </div>

    <!-- Edit Article Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <h2>Edit Article</h2>
        <form @submit.prevent="saveArticleChanges">
          <label>Title</label>
          <input v-model="editedArticle.Title" type="text" required />

          <label>Author</label>
          <input v-model="editedArticle.Author" type="text" required />

            <div class="form-group">
              <label for="category" class="form-label">Category</label>
              <select id="categoryEdit" v-model="editedArticle.Category" required class="form-select full-width">
                  <option disabled value="">Select Category</option>
                  <option>Activities</option>
                  <option>Education</option>
                  <option>Nutrition</option>
              </select>
            </div>

          <label>Description</label>
          <textarea v-model="editedArticle.Description" placeholder="Enter the article description" required></textarea>

          <label>Content</label>
          <textarea 
              v-model="editedArticle.Content" 
              placeholder="Enter the article content" 
              required 
              rows="10" 
              style="resize: vertical;">
          </textarea>

          <!-- Display Existing Article Image if available -->
          <label>Current Article Image</label>
          <div v-if="editedArticle.ImageUrl" class="current-image-container">
              <img :src="editedArticle.ImageUrl" alt="Current Article Image" class="current-article-image" />
          </div>

          <!-- Upload New Article Image -->
          <label>Upload New Article Image</label>
          <input type="file" @change="handleEditedImageUpload" accept="image/*" />

          <button type="submit">Save Changes</button>
          <button type="button" @click="closeEditModal">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref as vueRef, onMounted } from 'vue';
import { db, collection, getDocs, deleteDoc, doc, updateDoc, addDoc, Timestamp, storage } from '../firebaseConfig.js';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js';
import AdminNavBar from '../components/AdminNavBar.vue';
import CustomHeader from "../components/CustomHeader.vue";

const articles = vueRef([]);
const showEditModal = vueRef(false);
const editedArticle = vueRef(null);
const showArticleForm = vueRef(false);
const newArticle = vueRef({
  Title: '',
  Author: '',
  Category: '',
  Description: '',
  Content: '',
  ImageUrl: null
});

const articleImageFile = vueRef(null);
const editedArticleImageFile = vueRef(null);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    articleImageFile.value = file;
  }
};

const handleEditedImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    editedArticleImageFile.value = file;
  }
};

const closeArticleForm = () => {
  showArticleForm.value = false;
  newArticle.value = { Title: '', Author: '', Category: '', Description: '', Content: '', ImageUrl: null };
  articleImageFile.value = null;
};

const publishArticle = async () => {
  if (!newArticle.value.Title || !newArticle.value.Author || !newArticle.value.Category || !newArticle.value.Description) return;

  try {
    const articlesCollection = collection(db, "articles");
    let imageUrl = null;

    if (articleImageFile.value) {
      const articleDoc = await addDoc(articlesCollection, {});
      const imageRef = storageRef(storage, `Articles/${articleDoc.id}.jpg`);
      await uploadBytes(imageRef, articleImageFile.value);
      imageUrl = await getDownloadURL(imageRef);

      await updateDoc(articleDoc, {
        Title: newArticle.value.Title,
        Author: newArticle.value.Author,
        Category: newArticle.value.Category,
        Description: newArticle.value.Description,
        Content: newArticle.value.Content.split('\n').filter(line => line.trim() !== ''),
        Date: Timestamp.fromDate(new Date()),
        Likes: 0,
        Dislikes: 0,
        Saved: false,
        ImageUrl: imageUrl
      });
    } else {
      await addDoc(articlesCollection, {
        Title: newArticle.value.Title,
        Author: newArticle.value.Author,
        Category: newArticle.value.Category,
        Description: newArticle.value.Description,
        Content: newArticle.value.Content.split('\n').filter(line => line.trim() !== ''),
        Date: Timestamp.fromDate(new Date()),
        Likes: 0,
        Dislikes: 0,
        Saved: false,
        ImageUrl: null
      });
    }

    closeArticleForm();
    fetchArticles();
  } catch (error) {
    console.error("Error publishing article:", error.message);
  }
};

const fetchArticles = async () => {
  const articlesCollection = collection(db, 'articles');
  const querySnapshot = await getDocs(articlesCollection);
  articles.value = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  updateTotalPages();
};

const deleteArticle = async (articleId) => {
  try {
    await deleteDoc(doc(db, 'articles', articleId));
    articles.value = articles.value.filter((article) => article.id !== articleId);
    fetchArticles();
  } catch (error) {
    console.error('Error deleting article:', error);
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editedArticle.value = null;
  editedArticleImageFile.value = null;
};

const openEditModal = (article) => {
  showEditModal.value = true;
  editedArticle.value = {
    ...article,
    Content: Array.isArray(article.Content) 
      ? article.Content.join('\n\n') 
      : article.Content,
  };
};

const saveArticleChanges = async () => {
  if (!editedArticle.value) return;

  try {
    const articleDocRef = doc(db, 'articles', editedArticle.value.id);
    let updatedImageUrl = editedArticle.value.ImageUrl;

    if (editedArticleImageFile.value) {
      const imageRef = storageRef(storage, `Articles/${editedArticle.value.id}.jpg`);
      await uploadBytes(imageRef, editedArticleImageFile.value);
      updatedImageUrl = await getDownloadURL(imageRef);
    }

    const articleData = {
      Title: editedArticle.value.Title,
      Author: editedArticle.value.Author,
      Category: editedArticle.value.Category,
      Description: editedArticle.value.Description,
      Content: editedArticle.value.Content.split('\n').filter(line => line.trim() !== ''),
    };

    if (updatedImageUrl !== undefined) {
      articleData.ImageUrl = updatedImageUrl;
    }

    await updateDoc(articleDocRef, articleData);
    closeEditModal();
    fetchArticles();
  } catch (error) {
    console.error('Error saving article changes:', error);
  }
};

const itemsPerPage = vueRef(5);
const currentPage = vueRef(1);
const totalPages = vueRef(1);
const paginatedArticles = vueRef([]);

const changePage = (page) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
  updatePaginatedArticles();
};

const updatePaginatedArticles = () => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + parseInt(itemsPerPage.value, 10);
  paginatedArticles.value = articles.value.slice(start, end);
};

const updateTotalPages = () => {
  totalPages.value = Math.ceil(articles.value.length / itemsPerPage.value);
  currentPage.value = 1;
  updatePaginatedArticles();
};

const updateItemsPerPage = () => {
  updateTotalPages();
};

onMounted(fetchArticles);
</script>

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

.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    margin-bottom: 20px;
    border-bottom: 2px solid #f4f4f4;
    position: relative;
}

.header-container h1 {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.add-article-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 16px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.add-article-button:hover {
    background-color: #45a049;
}

.add-article-button:active {
    background-color: #3e8e41;
}
.table-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    overflow-x: auto;
}

table {
    width: 90%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: #fff;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

th, td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: left;
}

thead th {
    background-color: #FF9689;
    color: white;
    font-weight: bold;
    font-size: 16px;
    text-transform: uppercase;
}

th {
    background-color: #f4f4f4;
    font-weight: bold;
}

tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}

button {
    margin-right: 8px;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:not(.add-article-button):first-of-type {
    background-color: #FFC107;
    color: white;
}

button:not(.add-article-button):last-of-type {
    background-color: #f44336; 
    color: white;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh; 
  overflow-y: auto; 
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
}

.modal-content h2 {
  margin-top: 0;
  text-align: center;
}


form label {
    display: block;
    margin-top: 10px;
    font-weight: bold;
}

form input, form textarea {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

form button {
    margin-top: 15px;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
}

form button[type="submit"] {
    background-color: #4CAF50;
    color: white;
}

form button[type="button"]:not(:last-of-type) {
    background-color: #2196F3;
    color: white;
}

form button[type="button"]:last-of-type {
    background-color: #f44336;
    color: white;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

.current-image-container {
  margin: 10px 0;
  text-align: center;
}

.current-article-image {
  max-width: 200px; 
  max-height: 150px; 
  height: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
  object-fit: cover; 
}

.pagination-controls-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
}

.pagination-controls, .pagination-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.pagination-controls select {
  margin-left: 10px;
  padding: 5px;
}

.pagination-navigation button {
  padding: 8px 12px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
}

.pagination-navigation span {
  margin: 0 10px;
}

.pagination-navigation button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
.current-image-container {
  margin: 10px 0;
  text-align: center;
  }
  
.current-article-image {
max-width: 200px; /* Limit the image width */
max-height: 150px; /* Limit the image height */
height: auto;
border-radius: 8px;
border: 1px solid #ddd;
object-fit: cover; /* Ensures image fits nicely within specified dimensions */
}

.form-group {
    width: 100%;
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #333;
}

.form-select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    transition: border-color 0.3s, box-shadow 0.3s;
    appearance: none; /* Removes default dropdown arrow for custom styling */
}

.form-select:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
}

.full-width {
    width: 100%;
}
@media (max-width: 768px) {
    .header-container, .table-container, .modal-content {
      width: 100%;
      flex-direction: column;
      align-items: center;
    }

    .table-container table {
      margin-left: 30px;
      width: 100%;
      overflow: hidden;
    }

    .title {
        font-size: 24px;
    }

    .pagination-navigation button {
        width: 30%;
        font-size: 16px;
        margin-bottom: 10px;
        margin-top:10px;
    }
    .add-article-button{
      width: 40%;
        font-size: 16px;
        margin-top:60px;
    }

    .form-group {
        width: 100%;
    }
    .modal-content{
      width: 65%;
      height: 70vh;
    }
}
</style>