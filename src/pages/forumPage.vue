<script setup>
import NavBar from "../components/navBar.vue";
import ForumSidebar from "../components/forumsideBar.vue";
</script>

<template>
    <NavBar />
    <ForumSidebar />
    <div class="forum-content">
      <h1>Welcome to the Forum</h1>
      <!-- Main forum content goes here -->
    </div>
</template>

<style scoped>
.forum-content {
  margin-left: 250px;
  padding: 20px;
}

.forum-sidebar.collapsed + .forum-content {
  margin-left: 80px;
}
</style>
