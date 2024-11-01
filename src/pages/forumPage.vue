<script setup>
import { useRoute } from 'vue-router';
import NavBar from "../components/navBar.vue";
import ForumSidebar from "../components/forumsideBar.vue";
import CreatePost from "../components/createPost.vue";
import Posts from "../components/forumposts.vue";

const route = useRoute();

// Check if the current route is "/forum/createpost"
const isCreatePostRoute = route.path === '/forum/createpost';
</script>

<template>
  <NavBar />
  <ForumSidebar />
  <div class="forum-content">
    <template v-if="isCreatePostRoute">
      <CreatePost />
    </template>
    <template v-else>
      <Posts />
    </template>
  </div>
</template>

<style scoped>
.forum-content {
  padding-left: 300px;
}

.forum-sidebar.collapsed + .forum-content {
  margin-left: 80px;
}
</style>