<template>
    <div :class="['paper', { flipped: isFlipped }]" :style="{ zIndex: zIndex }" v-if="isWideEnough">
      <div class="front" :key="frontIndex" v-if="front">
        <div class="front-content d-block">
            <h3 class=text-center>{{ front.header }}</h3>
            <p class="text-center">{{ front.date }}</p>
            <hr>
            <img :src="front.imageURL" class="border rounded-1 d-block mx-auto" style="max-width: 300px; height: 150px;">
            <p class="p-3">{{ front.body }}</p>
            <button type="button" class="btn btn-danger p-1 d-flex mx-auto" @click="deleteFrontEntry">Delete Entry</button>
        </div>
      </div>
      <div class="front d-flex justify-content-center align-items-center" v-if="!front"> <!-- Center content of empty page -->
        <div class="front-content">
          <h3 class="text-center">Log a new entry!</h3>
        </div>
      </div>
      <div class="back" :key="backIndex" v-if="back">
        <div class="back-content d-block">
            <h3 class=text-center>{{ back.header }}</h3>
            <p class="text-center">{{ back.date }}</p>
            <hr>
            <img :src="back.imageURL" class="border rounded-1 d-block mx-auto" style="max-width: 300px; height: 150px;">
            <p class="p-3">{{ back.body }}</p>
            <button type="button" class="btn btn-danger p-1 d-flex mx-auto" @click="deleteBackEntry">Delete Entry</button>
        </div>
      </div>
      <div class="back d-flex justify-content-center align-items-center" v-if="!back"> <!-- Center content of empty page -->
        <div class="back-content">
          <h3 class="text-center">Log a new entry!</h3>
        </div>
      </div>
  </div>
  <div :class="['paper', { flipped: isFlipped }]" :style="{ zIndex: zIndex }" v-else>
    <div class="front" :key="index" v-if="entry">
      <div class="front-content d-block"> <!-- Both classes together in mobile screens -->
        <h3 class=text-center>{{ entry.header }}</h3>
        <p class="text-center">{{ entry.date }}</p>
        <hr>
        <img src="" class="border rounded-1 d-block mx-auto" style="max-width: 300px; height: 150px;">
        <p class="p-3">{{ entry.body }}</p>
        <button type="button" class="btn btn-danger p-1 d-flex mx-auto" @click="deleteEntry">Delete Entry</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isWideEnough: window.innerWidth >= 768,
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
  emits: ['deleteEntry'],
  methods: {
    deleteFrontEntry() {
      this.$emit('deleteEntry', this.frontIndex) //Emit frontIndex on deletion
    },
    deleteBackEntry() {
      this.$emit('deleteEntry', this.backIndex); //Emit backIndex on deletion
    },
    deleteEntry() {
      this.$emit('deleteEntry', this.index)
    }
  },
};
</script>

<style scoped>
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
  } /* Test */
}
</style>