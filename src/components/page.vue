<template>
  <!-- For desktop view -->
  <div :class="['paper', { flipped: isFlipped }]" :style="{ zIndex: zIndex }" v-if="isWideEnough">
    <div class="front" :key="frontIndex" v-if="front">
      <div class="front-content d-block">
        <div v-if="!isEditing">
          <h3 class=text-center>{{ front.header }}</h3>
          <p class="text-center">{{ front.date }}</p>
          <hr>
          <img :src="front.imageURL" class="border rounded-1 d-block mx-auto" v-if="front.imageURL">
          <p class="p-3">{{ front.body }}</p>
          <span class="d-flex justify-content-around">
            <button type="button" class="btn btn-primary p-1" @click="toggleEdit(front, frontIndex)">Edit Entry</button>
            <button type="button" class="btn btn-danger p-1" @click="deleteFrontEntry">Delete Entry</button>
          </span>
        </div>
        <div v-else>
          <form @submit.prevent="saveEntry">
            <div class="mb-3">
              <label for="header" class="form-label">Header:</label>
              <input type="text" id="header" v-model="editData.header" class="form-control">
            </div>
            <div class="mb-3">
              <label for="date" class="form-label">Date:</label>
              <input type="date" id="date" v-model="editData.date" class="form-control">
            </div>
            <div class="mb-3">
              <label for="imageURL" class="form-label">Image URL:</label>
              <input type="file" id="imageURL" class="form-control" @change="setImage">
            </div>
            <div class="mb-3">
              <label for="body" class="form-label">Body:</label>
              <textarea id="body" v-model="editData.body" class="form-control" rows="7"></textarea>
            </div>
            <button type="submit" class="btn btn-success p-1 d-flex mx-auto">Save Changes</button>
            <button type="button" class="btn btn-secondary p-1 d-flex mx-auto mt-2" @click="toggleEdit">Cancel</button>
          </form>
        </div>
      </div>
    </div>
    <div class="back" :key="backIndex" v-if="back">
      <div class="back-content d-block">
        <div v-if="!isEditing">
          <h3 class=text-center>{{ back.header }}</h3>
          <p class="text-center">{{ back.date }}</p>
          <hr>
          <img :src="back.imageURL" class="border rounded-1 d-block mx-auto" v-if="back.imageURL">
          <p class="p-3">{{ back.body }}</p>
          <span class="d-flex justify-content-around">
            <button type="button" class="btn btn-primary p-1" @click="toggleEdit(back, backIndex)">Edit Entry</button>
            <button type="button" class="btn btn-danger p-1" @click="deleteBackEntry">Delete Entry</button>
          </span>
        </div>
        <div v-else>
          <form @submit.prevent="saveEntry">
            <div class="mb-3">
              <label for="header" class="form-label">Header:</label>
              <input type="text" id="header" v-model="editData.header" class="form-control">
            </div>
            <div class="mb-3">
              <label for="date" class="form-label">Date:</label>
              <input type="date" id="date" v-model="editData.date" class="form-control">
            </div>
            <div class="mb-3">
              <label for="imageURL" class="form-label">Image URL:</label>
              <input type="file" id="imageURL" class="form-control" @change="setImage">
            </div>
            <div class="mb-3">
              <label for="body" class="form-label">Body:</label>
              <textarea id="body" v-model="editData.body" class="form-control" rows="7"></textarea>
            </div>
            <button type="submit" class="btn btn-success p-1 d-flex mx-auto">Save Changes</button>
            <button type="button" class="btn btn-secondary p-1 d-flex mx-auto mt-2" @click="toggleEdit">Cancel</button>
          </form>
        </div>
      </div>
    </div>
    <div class="back d-flex justify-content-center align-items-center" v-if="!back"> <!-- Center content of empty page -->
      <div class="back-content">
        <h3 class="text-center">Log a new entry!</h3>
      </div>
    </div>
  </div>
  <!-- Desktop view end -->
  <!-- For mobile view -->
  <div :class="['paper', { flipped: isFlipped }]" :style="{ zIndex: zIndex }" v-else>
    <div class="front" :key="index" v-if="entry">
      <div class="front-content d-block">
        <div v-if="!isEditing">
          <h3 class=text-center>{{ entry.header }}</h3>
          <p class="text-center">{{ entry.date }}</p>
          <hr>
          <img :src="entry.imageURL" v-if="entry.imageURL" class="border rounded-1 d-block mx-auto">
          <p class="p-3">{{ entry.body }}</p>
          <span class="d-flex justify-content-around">
            <button type="button" class="btn btn-primary p-1" @click="toggleEdit(entry, index)">Edit Entry</button>
            <button type="button" class="btn btn-danger p-1" @click="deleteEntry">Delete Entry</button>
          </span>
        </div>
        <div v-else>
          <form @submit.prevent="saveEntry">
            <div class="mb-3">
              <label for="header" class="form-label">Header:</label>
              <input type="text" id="header" v-model="editData.header" class="form-control">
            </div>
            <div class="mb-3">
              <label for="date" class="form-label">Date:</label>
              <input type="date" id="date" v-model="editData.date" class="form-control">
            </div>
            <div class="mb-3">
              <label for="imageURL" class="form-label">Image URL:</label>
              <input type="file" id="imageURL" class="form-control" @change="setImage">
            </div>
            <div class="mb-3">
              <label for="body" class="form-label">Body:</label>
              <textarea id="body" v-model="editData.body" class="form-control" rows="7"></textarea>
            </div>
            <button type="submit" class="btn btn-success p-1 d-flex mx-auto">Save Changes</button>
            <button type="button" class="btn btn-secondary p-1 d-flex mx-auto mt-2" @click="toggleEdit">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  </div>
  <!-- Mobile view end -->
</template>

<script>
export default {
  data() {
    return {
      isWideEnough: window.innerWidth >= 768,
      isEditing: false,
      editData: {},
      entryIndex: null, // Track the index of the entry being edited
    }
  },
  props: {
    //Screen >= 768px
    front: Object,
    back: Object,
    zIndex: Number, //Used across both mobile and desktop
    isFlipped: Boolean, //Used for both mobile and desktop
    frontIndex: Number,
    backIndex: Number,
    //Screen < 768px
    index: Number,
    entry: Object
  },
  emits: ['deleteEntry', 'updateEntry'],
  methods: {
    deleteFrontEntry() {
      this.$emit('deleteEntry', this.frontIndex) //Emit frontIndex on deletion
    },
    deleteBackEntry() {
      this.$emit('deleteEntry', this.backIndex); //Emit backIndex on deletion
    },
    deleteEntry() {
      this.$emit('deleteEntry', this.index)
    },
    toggleEdit(entry, index) {
      this.isEditing = !this.isEditing;
      if (this.isEditing) {
        // Set initial form fields of editing page to the current entry
        this.editData = { ...entry };
        this.entryIndex = index;  // Save the index of the entry being edited
        if (this.editData.date) {
          const [day, month, year] = this.editData.date.split('/');
          this.editData.date = `${year}-${month}-${day}`; 
        }; // Re-convert the entry's date to yyyy-mm-dd format to prevent date format error
      } else {
        this.entryIndex = null;  // Reset the index when not editing
        this.editData = {}; // Resets the edit form field when users decide not to commit changes
      }
    },
    setImage(event) {
      const fileInput = event.target.files;
      this.editData.imageURL = fileInput[0];
    },
    async saveEntry() {
      if (this.entryIndex !== null) {
        const updatedDoc = { ...this.editData };
        this.isEditing = false;
        this.$emit('updateEntry', updatedDoc, this.entryIndex);
      }
    }
  },
};
</script>

<style scoped>
.form-label, input, textarea {
  font-family: sans-serif;
}

.paper {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  perspective: 1500px;
}

.front, .back {
  background-color: white;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform-origin: left;
  transition: transform 0.5s;
}

.front {
  z-index: 1;
  backface-visibility: hidden;
  border-left: 3px solid #eed4d4;
}

.back {
  z-index: 0;
}

.front-content, .back-content {
  max-width: 100%;
  max-height: 100%;
  padding: 1em;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Un-mirrors backpage content */
.back-content {
  transform: rotateY(180deg);
}

/* Prevent overflow of body content */
.p-3 {
  max-width: 100%;
  overflow-y: auto;
  word-wrap: break-word;
}

/* Flip effect */
.flipped .front,
.flipped .back {
  transform: rotateY(-180deg);
  transition: transform 0.5s;
}

img {
  max-width: 300px;
  height: 150px;
}

@media (max-width: 768px) {
  .front .back {
    background-color: white;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  .flipped .front,
  .flipped .back {
    transform: translateX(-400px);
    transition: transform 0.5s;
  } /* Changed page animation for mobile */
  /* Change image dimensions to prevent overflow of diary content on mobile */
  img {
    max-width: 200px; 
    height: 100px;
  }
}
</style>