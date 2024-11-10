<script onload>

</script>
<template>
	<div class="table-container">
		<div class="center">
			<button type="button" class="btn btn-primary m-3" @click="openModal">
				View All Logs
			</button>
		</div>

		<div class="center">
			<table class="container m-3" id="main">
			<tbody>
				<tr>
					<th>Date of Birth</th>
					<td
						v-for="(post, index) in limitedPosts"
						:key="`date-${index}`"
					>
					{{ post.dateOfBirth }}
					</td>
					<td
						v-for="n in Math.max(0, 6 - limitedPosts.length)"
						:key="`date-empty-${n}`"
					></td>
				</tr>
				<tr>
					<th>Date of Record</th>
					<td
						v-for="(post, index) in limitedPosts"
						:key="`date-${index}`"
					>
						{{ post.date || "" }}
					</td>
					<td
						v-for="n in Math.max(0, 6 - limitedPosts.length)"
						:key="`date-empty-${n}`"
					></td>
				</tr>
				<tr>
					<th>Current age</th>
					<td v-for="post in limitedPosts" :key="`age-${post.id}`">
						{{ post.age || "" }}
					</td>
					<td
						v-for="n in Math.max(0, 6 - limitedPosts.length)"
						:key="`age-empty-${n}`"
					></td>
				</tr>
				<tr>
					<th>Weight (in kg)</th>
					<td v-for="post in limitedPosts" :key="`weight-${post.id}`">
						{{ post.weight || "" }}
					</td>
					<td
						v-for="n in Math.max(0, 6 - limitedPosts.length)"
						:key="`weight-empty-${n}`"
					></td>
				</tr>
				<tr>
					<th>Height / Length (in cm)</th>
					<td v-for="post in limitedPosts" :key="`height-${post.id}`">
						{{ post.height || "" }}
					</td>
					<td
						v-for="n in Math.max(0, 6 - limitedPosts.length)"
						:key="`height-empty-${n}`"
					></td>
				</tr>
				<tr>
					<th>Remarks</th>
					<td v-for="n in 6" :key="`remarks-${n}`">
						{{
							limitedPosts[n - 1]
								? limitedPosts[n - 1].remarks
								: ""
						}}
					</td>
				</tr>
			</tbody>
		</table>
		</div>
	</div>
		
		<div v-if="showModal" class="modal">
			<div class="modal-content">
        <span>
				<button @click="closeModal" class="close-btn"><span class="close text-end" >&times;</span></button>
      </span>
        <h2 class="text-center">All Posts</h2>
        <div class="row">
        <div class="col-md-1"></div>
        <div class="col-md-10">
		<div class="inner-table-wrapper">
			<table class="inner-table m-5">
			<thead>
				<tr>
				<th>Date of Record</th>
				<th>Current Age</th>
				<th>Weight (in kg)</th>
				<th>Height / Length (in cm)</th>
				<th>Remarks</th>
				<th>Actions</th>
				</tr>
			</thead>
			<tbody>
			<tr v-for="(post, index) in limitedPosts" :key="`post-${index}`">
				<td>
				<!-- If editing this post, show input; otherwise, show plain text -->
				<span v-if="editingPost?.id !== post.id">{{ post.date || "" }}</span>
				<input
					v-else
					type="date"
					v-model="editingPost.date"
				/>
				</td>
				<td>
				<span v-if="editingPost?.id !== post.id">{{ post.age || "" }}</span>
				<select v-else v-model="editingPost.age">
					<option value="0-2 months">0-2 months</option>
					<option value="2-4 months">2-4 months</option>
					<option value="4-6 months">4-6 months</option>
					<option value="6-9 months">6-9 months</option>
					<option value="9-12 months">9-12 months</option>
					<option value="12-18 months">12-18 months</option>
					<option value="18-24 months">18-24 months</option>
				</select>
				</td>
				<td>
				<span v-if="editingPost?.id !== post.id">{{ post.weight || "" }}</span>
				<input
					v-else
					type="number"
					v-model="editingPost.weight"
				/>
				</td>
				<td>
				<span v-if="editingPost?.id !== post.id">{{ post.height || "" }}</span>
				<input
					v-else
					type="number"
					v-model="editingPost.height"
				/>
				</td>
				<td>
				<span v-if="editingPost?.id !== post.id">{{ post.remarks || "" }}</span>
				<textarea v-else v-model="editingPost.remarks"></textarea>
				</td>
				<td>
				<!-- Edit, Save, and Cancel buttons -->
				<button class="m-1 p-2 pe-3 ps-3" v-if="editingPost?.id !== post.id" @click="editPost(post)">
					Edit
				</button>
				<button class="m-1 p-2 pe-3 ps-3 " v-else @click="savePost(post.id)">Save</button>
				<button class="m-1 p-2" v-if="editingPost?.id === post.id" @click="cancelEdit">Cancel</button>
				<button class="m-1 p-2" @click="deletePost(post.id)">Delete</button>
				</td>
			</tr>
			</tbody>
			</table>
		</div>
      </div>
        <div class="col-md-1"></div>
      </div>

			</div>
		</div>
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
	data() {
		return {
			showModal: false,
			currentPost: null,
      editingPost: null,
		};
	},
	computed: {
		limitedPosts() {
			// Ensure only the latest 6 posts are displayed
			return this.posts.slice(-6);
		},
	},
	methods: {
		openModal() {
			this.showModal = true;
		},
		closeModal() {
			this.showModal = false;
		},
		async savePost(postId) {
			if (!this.editingPost) return;
					// Find the post in the array and update it with the modified values
			try {
					const index = this.posts.findIndex((p) => p.id === postId)
					if (index !== -1) {
						this.$emit('update-post', { ...this.editingPost }); // Emit the event to the parent to update post
					}
					this.editingPost = null;
					this.closeModal();
			} catch (error) {
			console.error(error);
			}
		},
		editPost(post) {
			this.editingPost = { ...post };
		},
		cancelEdit() {
			this.editingPost = null;
		},
		deletePost(postId) {
			// Emit the delete event to the parent component
			this.$emit("delete-post", postId);
		},
	},
};
</script>

<style scoped>
.table-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin-top: 20px;
}

.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  
}
.modal-content {
	background-color: white;
	margin: auto;
	padding: 20px;
	width: 80%;
	border-radius: 10px;
  min-width: 90%;
  max-width: 500px;
  max-height: 80%;
  overflow: auto;
}
.close {
	font-size: 28px;
	cursor: pointer;

  color: white;
  
}
.close-btn{
  float: right;
  background-color: red;
  padding: 0px 10px;
  margin: 5px;
  border-radius: 5px;
}
.inner-table-wrapper {
  overflow-x: auto; /* Allows horizontal scrolling for the table */
  width: 100%; /* Ensures the wrapper takes full width */
}
.inner-table {
  border-collapse: collapse;
  width: 100%;
  align-items: center;
  margin: 0 auto;
  min-width: 200px;
  max-width: 90%;
  background-color: rgb(232, 230, 207);
}
.inner-table {
  border: 1px solid rgb(205, 198, 198);
}
.inner-table tr {
  border-bottom: 1px solid rgb(192, 184, 184); /* Adds horizontal line */
}
.inner-table th{
  text-align: center ;
}
.inner-table td{
  text-align: center;
}

.inner-table tr:last-child {
  border-bottom: none; /* Remove border from the last row */
}
button {
  /* max-width: 100px; */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

table {
	width: 800px;
	border-collapse: collapse;
	overflow: hidden;
	box-shadow: 0 0 20px rgba(0,0,0,0.1);
	margin:auto;
	background-color: rgb(229, 229, 234);
}

th,
td {
	padding: 15px;
	background-color: rgba(255,255,255,0.2);
	color: black;
	text-align: left;
}

th {
	text-align: left;
}

thead {
	th {
		background-color: #FF9689;
	}
}
#main {
  overflow: auto;
}
#main > tbody  {
	tr {
		&:hover {
			background-color: rgba(247, 7, 7, 0.3);
		}
	}
}
.inner-table > tbody {
	tr {
		&:hover {
			background-color: rgba(247, 7, 7, 0.3);
		}
	}
	td {
		&:hover {
				background-color: rgba(247, 7, 7, 0.3);
		}
	}
}
.center {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column; /* Stack items vertically */
}
</style>
