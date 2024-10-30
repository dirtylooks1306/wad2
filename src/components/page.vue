<template>
    <div :class="['paper', { flipped: isFlipped }]" :style="{ zIndex: zIndex }">
      <div class="front" :key="frontIndex" v-if="front">
        <div class="front-content d-block">
            <h3 class=text-center>{{ front.header }}</h3>
            <p class="text-center">{{ front.date }}</p>
            <hr>
            <p class="p-3">{{ front.body }}</p>
            <button type="button" class="btn btn-danger p-1 d-flex mx-auto" @click="deleteFrontEntry">Delete Entry</button>
        </div>
      </div>
      <div class="back" :key="backIndex" v-if="back">
        <div class="back-content d-block">
            <h3 class=text-center>{{ back.header }}</h3>
            <p class="text-center">{{ back.date }}</p>
            <hr>
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
</template>

<script>
export default {
  props: {
    front: Object,
    back: Object,
    zIndex: Number,
    isFlipped: Boolean,
    frontIndex: Number,
    backIndex: Number,
  },
  emits: ['deleteEntry'],
  methods: {
    deleteFrontEntry() {
      this.$emit('deleteEntry', this.frontIndex) //Emit frontIndex on deletion
    },
    deleteBackEntry() {
      this.$emit('deleteEntry', this.backIndex); //Emit backIndex on deletion
    }
  }
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
</style>