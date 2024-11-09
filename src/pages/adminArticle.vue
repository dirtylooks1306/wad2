<script setup>
import { ref, onMounted } from 'vue';
import { db, collection, getDocs, deleteDoc, doc, updateDoc, addDoc,Timestamp } from '../firebaseConfig.js';
import AdminNavBar from '../components/AdminNavBar.vue';

const articles = ref([]);
const showEditModal = ref(false);
const editedArticle = ref(null);
const showArticleForm = ref(false); // Controls form visibility
const newArticle = ref({
  Title: '',
  Author: '',
  Category: '',
  Description: '',
  Content: ''
});
const closeArticleForm = () => {
  showArticleForm.value = false;
  newArticle.value = { Title: '', Author: '', Category: '', Description: '', Paragraphs: [''] };
};

const publishArticle = async () => {
  if (!newArticle.value.Title || !newArticle.value.Author || !newArticle.value.Category || !newArticle.value.Description) return;

  try {
    const articlesCollection = collection(db, "articles");
    const articleData = {
      Title: newArticle.value.Title,
      Author: newArticle.value.Author,
      Category: newArticle.value.Category,
      Description: newArticle.value.Description,
      Content: newArticle.value.Content.split('\n').filter(line => line.trim() !== ''),
      Date: Timestamp.fromDate(new Date()),
      Likes: 0,
      Dislikes: 0,
      Saved: false,
    };

    await addDoc(articlesCollection, articleData);
    closeArticleForm(); // Reset form fields and close the form
    fetchArticles(); // Refresh articles list after publishing
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
};

const deleteArticle = async (articleId) => {
try {
    await deleteDoc(doc(db, 'articles', articleId));
    articles.value = articles.value.filter((article) => article.id !== articleId);
} catch (error) {
    console.error('Error deleting article:', error);
}
};

const closeEditModal = () => {
    showEditModal.value = false;
    editedArticle.value = null;
};

const openEditModal = (article) => {
    showEditModal.value = true;
    editedArticle.value = {
    ...article,
    Paragraphs: article.Paragraphs || [''], // Initialize Paragraphs as an array if it's missing
    };
};


const saveArticleChanges = async () => {
  if (!editedArticle.value) return;

  try {
    const articleDocRef = doc(db, 'articles', editedArticle.value.id);
    const articleData = {
      Title: editedArticle.value.Title,
      Author: editedArticle.value.Author,
      Category: editedArticle.value["Filter"],
      Description: editedArticle.value.Description, 
      Content: newArticle.value.Content.split('\n').filter(line => line.trim() !== ''),
    };

    await updateDoc(articleDocRef, articleData);
    showEditModal.value = false;
    editedArticle.value = null;
    fetchArticles(); // Refresh articles list after editing
  } catch (error) {
    console.error('Error saving article changes:', error);
  }
};


  
onMounted(fetchArticles);
</script>

<template>
    <AdminNavBar />
    <div>
        <h1 class="text-center mt-1">Articles Management</h1>
        <div class="header-container">
            <div></div>
            <button @click="showArticleForm = true" class="add-article-button text-end">Add Article</button>
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

                    <label>Category</label>
                    <input v-model="newArticle.Category" type="text" required />

                    <label>Description</label>
                    <textarea v-model="newArticle.Description" placeholder="Enter article description" required></textarea>
                    
                    <label>Content</label>
                    <textarea v-model="newArticle.Content" placeholder="Enter article content" required></textarea>

                    <button type="submit">Publish Article</button>
                    <button type="button" @click="closeArticleForm">Cancel</button>
                </form>
            </div>
        </div>

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
                    <tr v-for="article in articles" :key="article.id">
                        <td>{{ article.Title }}</td>
                        <td>{{ article.Author }}</td>
                        <td>{{ article["Filter"] }}</td>
                        <td>
                            <button @click="openEditModal(article)">Edit</button>
                            <button @click="deleteArticle(article.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
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

                    <label>Category</label>
                    <input v-model="editedArticle.Filter" type="text" required />

                    <label>Description</label>
                    <textarea v-model="editedArticle.Description" placeholder="Enter the article description" required></textarea>
                    
                    <label>Content</label>
                    <textarea v-model="editedArticle.Content" placeholder="Enter the article content with paragraphs and blank lines as needed" required  rows='5' style='resize: vertical;'></textarea>
                    
                    <button type="submit">Save Changes</button>
                    <button type="button" @click="closeEditModal">Cancel</button>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>

.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    margin-bottom: 20px;
    border-bottom: 2px solid #f4f4f4;
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

/* Improve header style */
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

/* Button styling */
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

/* Modal styling */
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
</style>

