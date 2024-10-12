<template>
  <div class="subforum-row">
      <div class="subforum-icon subforum-column center">
          <i :class="`fa ${post.icon}`"></i>
      </div>
      <div class="subforum-description subforum-column">
          <h4><a :href="post.link">{{ post.title }}</a></h4>
          <p>{{ post.description }}</p>
      </div>
      <div class="subforum-stats subforum-column center">
          <span>{{ post.postsCount }} Posts | {{ post.topicsCount }} Topics</span>
      </div>
      <div class="subforum-info subforum-column">
          <b><a :href="post.lastPostLink">Last post</a></b> by <a :href="post.lastPosterLink">{{ post.lastPoster }}</a>
          <br />on <small>{{ post.lastPostDate }}</small>
      </div>
  </div>
</template>

<script>
export default {
  props: {
      post: {
          type: Object,
          required: true
      }
  }
}
</script>

<style scoped>
.subforum-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.subforum-column {
  padding: 0 15px;
}

.center {
  text-align: center;
}

/* Adjustments for various styling */
.subforum-icon i {
  font-size: 1.5rem; /* Adjust icon size */
}

.subforum-description h4 a, .subforum-info a {
  color: #007bff; /* Example link color */
}
</style>
