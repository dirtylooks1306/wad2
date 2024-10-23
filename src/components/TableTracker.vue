<template>
    <table class="logging-table">
      <tbody>
        <tr>
          <th>Date of Record</th>
          <td v-for="(post, index) in limitedPosts" :key="index">
            {{ post.date || "" }}
          </td>
          <td v-for="n in 6 - posts.length" :key="n + posts.length"></td>
        </tr>
        <tr>
          <th>Current age</th>
          <td v-for="post in limitedPosts" :key="post.id">
            {{ post.age || "" }}
          </td>
          <td v-for="n in 6 - posts.length" :key="n + posts.length"></td>
        </tr>
        <tr>
          <th>Weight (in kg)</th>
          <td v-for="post in limitedPosts" :key="post.id">
            {{ post.weight || "" }}
          </td>
          <td v-for="n in 6 - posts.length" :key="n + posts.length"></td>
        </tr>
        <tr>
          <th>Height / Length (in cm)</th>
          <td v-for="post in limitedPosts" :key="post.id">
            {{ post.height || "" }}
          </td>
          <td v-for="n in 6 - posts.length" :key="n + posts.length"></td>
        </tr>
        <tr>
          <th>Remarks</th>
          <td v-for="n in 6" :key="n">
            {{ limitedPosts[n - 1] ? limitedPosts[n - 1].remarks : "" }}
          </td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script>
  export default {
    name: "TableComponent",
    props: {
      posts: {
        type: Array,
        required: true,
      },
    },
    computed: {
      limitedPosts() {
        // Ensure only the latest 6 posts are displayed
        return this.posts.slice(-6);
      },
    },
  };
  </script>

<style scoped>
table, tr, td, th, thead, tbody {
	border: 2px solid black;
}
.logging-table th,
.logging-table td {
	min-width: 100px;
	text-align: left;
	padding: 10px;
}
</style>