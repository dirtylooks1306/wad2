<script setup>
import Page from './page.vue';
</script>

<template>
    <div class="diary-container">
        <button type="button" class="btn btn-secondary border-0 p-3 my-2 collapsible" :class="{ active: open }" @click="toggle">
            {{ dbDiary.id }}
        </button>
        <!-- Collapsible component -->
        <div class="content" :style="contentStyle">
            <div class="diary-block container-fluid"> <!-- Container fluid to accomodate different screen dimensions -->
                <!-- Assumption: CradleCare is purely web application -->
                <div class="row row-cols-xl-3 row-cols-lg-1 w-100 align-items-center">
                    <div class="col-xl-3 col-lg-12 text-xl-end text-center"> <!-- Column for 'Prev Page' button -->
                        <!-- Prev Button; On top of diary on smaller screens, positioned on left page of diary when opened -->
                        <button type="button" class="btn btn-secondary p-2" ref="prevBtn" @click="prevPage">
                            Prev Page
                        </button>
                    </div>
                    <div class="col-xl-6 col-lg-12 d-flex justify-content-center"> <!-- Column for diary -->
                        <!-- Diary -->
                        <div ref="diary" class="diary">
                            <!-- Paper Component -->
                            <Page 
                            v-for="(pair, index) in pagedEntries"
                            :key="index"
                            :front="pair[0]"
                            :back="pair[1]"
                            :frontIndex="index * 2"
                            :backIndex="(index * 2) + 1"
                            :ref="`p${index+1}`"
                            :style="{ zIndex: getZIndex(index) }"
                            :isFlipped="isFlipped(index)"
                            @deleteEntry="deleteEntry"
                            v-if="isWideEnough" 
                            />
                            <Page
                            v-else
                            v-for="(entry, i) in dbDiary.entries"
                            :entry="entry"
                            :index="i"
                            :ref="`p${i+1}`"
                            :style="{ zIndex: getZIndex(i) }"
                            :isFlipped="isFlipped(i)"
                            @deleteEntry="deleteEntry"
                            />
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-12 text-xl-start text-center"> <!-- Column for 'Next Page' button -->
                        <!-- Next Button; Below diary on smaller screens, positioned on right page of diary when opened -->
                        <button type="button" class="btn btn-secondary p-2" ref="nextBtn" @click="nextPage">
                            Next Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Diary',
        emits: ['deleteEntry'],
        data() {
            return {
                open: false, //For collapsible
                currentLocation: 1,
                flippedPapers: [], //Track flipped papers by indices
                cycledEntries: [],
                isWideEnough: window.innerWidth >= 768,
            }
        },
        components: {
            Page,
        },
        //Diary component uses each diary object from diaryPage with its respective index
        props: {
            dbDiary: Object,
        },
        methods: {
            //Passes toggle event to diaryPage to open or close the collapsible
            toggle() {
                this.open = !this.open;
            },
            checkWidth() {
                this.isWideEnough = window.innerWidth >= 768;
            },
            //Diary functions
            openBook() {
                this.$refs.diary.style.transform = "translateX(50%)";
                this.$refs.prevBtn.style.transform = "translateX(-180px)";
                this.$refs.nextBtn.style.transform = "translateX(180px)";
            },
            closeBook(isAtBeginning) {
                if (isAtBeginning) {
                    this.$refs.diary.style.transform = "translateX(0%)";
                } else {
                    this.$refs.diary.style.transform = "translateX(100%)";
                }
                this.$refs.prevBtn.style.transform = "translateX(0px)";
                this.$refs.nextBtn.style.transform = "translateX(0px)";
            },
            nextPage() {
                if (this.isWideEnough) {
                    if (this.currentLocation < this.pagedEntries.length + 1) {
                        if (this.currentLocation === 1) {
                            this.openBook();
                        }
                        if (!this.flippedPapers.includes(this.currentLocation)) {
                            this.flippedPapers.push(this.currentLocation);
                        }
                            
                        this.currentLocation++;

                        if (this.currentLocation === this.pagedEntries.length + 1) {
                            this.closeBook(false);
                        }
                    }
                } else {
                    if (this.currentLocation < this.dbDiary.entries.length + 1) {
                        this.cycledEntries.push(this.currentLocation - 1);
                        this.currentLocation++;
                    }
                }  
                
                /*
                if (this.currentLocation < this.numPapers) {
                    switch(this.currentLocation) {
                        case 1:
                            this.openBook();
                            this.$refs.p1.classList.add('flipped')
                            this.$refs.p1.style.zIndex = 1;
                            break;
                        case 2:
                            this.$refs.p2.classList.add('flipped')
                            this.$refs.p2.style.zIndex = 2;
                            break;
                        case 3:
                            this.$refs.p3.classList.add('flipped')
                            this.$refs.p3.style.zIndex = 3;
                            this.closeBook(false)
                            break;
                        default:
                            throw new Error("unknown");
                    }
                    this.currentLocation++
                */
            },
            prevPage() {
                if (this.isWideEnough) {
                    if (this.currentLocation > 1) {
                        if (this.currentLocation === this.pagedEntries.length + 1) {
                            this.openBook();
                        }

                        const previous = this.currentLocation - 1;
                        this.flippedPapers = this.flippedPapers.filter(page => page !== previous);
                        this.currentLocation--
                            
                        if (this.currentLocation === 1) {
                            this.closeBook(true);
                        }
                    }
                }
                else {
                    if (this.currentLocation > 1) {
                        this.cycledEntries.pop(this.currentLocation - 1);
                        this.currentLocation--;
                    }
                }
                /*
                if (this.currentLocation > 1) {
                    switch(this.currentLocation) {
                        case 2:
                            this.closeBook(true);
                            this.$refs.p1.classList.remove('flipped')
                            this.$refs.p1.style.zIndex = 3;
                            break;
                        case 3:
                            this.$refs.p2.classList.remove('flipped')
                            this.$refs.p2.style.zIndex = 2;
                            break;
                        case 4:
                            this.openBook();
                            this.$refs.p3.classList.remove('flipped')
                            this.$refs.p3.style.zIndex = 1;
                            break;
                        default:
                            throw new Error("unknown");
                    }
                    this.currentLocation--
                */
            },
            isFlipped(index) {
                if (this.isWideEnough) {
                    return this.flippedPapers.includes(index + 1);
                }
                else {
                    return index in this.cycledEntries
                }
            },
            getZIndex(index) {
                if (this.isWideEnough) {
                    return this.isFlipped(index) ? index - this.pagedEntries.length : this.pagedEntries.length - index;
                } else {
                    return this.dbDiary.entries.length - index;
                }

                /*
                NOTE: Left side assignment is for assigning indexes when user goes to next page,
                right side assignment is for assigning indexes when user goes to previous page
                */
            },
            //Delete entry at specified index, change function to use dynamic storage
            deleteEntry(i) {
                this.$emit('deleteEntry', this.dbDiary.id, i)
            }
        },
        computed: {
            contentStyle() {
                return {
                    maxHeight: this.open ? "1000px" : "0"
                }
            },
            pagedEntries() {
                //Group entries in pairs for each page (two entries per page)
                const pages = [];
                for (let i = 0; i < this.dbDiary.entries.length; i += 2) {
                    pages.push([this.dbDiary.entries[i], this.dbDiary.entries[i+1]]);
                }
                return pages;
            },
        },
        mounted() {
            //References to elements
            const diary = this.$refs.diary;
            const prevBtn = this.$refs.prevBtn;
            const nextBtn = this.$refs.nextBtn;
            window.addEventListener('resize', this.checkWidth)
            /*
            //Event listeners
            prevBtn.addEventListener("click", this.prevPage);
            nextBtn.addEventListener("click", this.nextPage);
            */
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.checkWidth)
        }
    }
</script>

<style scoped>
/* Styling for collapsibles */
.collapsible {
  cursor: pointer;
  text-align: left;
  width: 100%;
  outline: none;
  font-size: 20px;
}

.active, .collapsible:hover {
  background-color: #555;
}

.collapsible:after {
  content: '\002B';
  color: white;
  font-weight: bold;
  float: right;
  margin-left: 5px;
}

.active:after {
  content: "\2212";
}

.content {
  padding: 0 18px;
  max-height: 0;
  margin-left: 17.5px; /* Aligns collapsible content with collapsible button */
  overflow: hidden;
  transition: max-height 0.2s ease-out;
  background-color: #eed4d4;
  display: flex;
  justify-content: space-around;
  position: relative;
}

/* Diary block */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.diary-block {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  font-family: 'Cherry Bomb', sans-serif;
}

/* Diary */
.diary {
  position: relative;
  width: 350px;
  height: 600px;
  transition: transform 0.5s;
}

/* Controller buttons */
button {
  border: none;
  cursor: pointer;
  margin: 10px;
  transition: transform 0.5s;
}

button:focus {
  outline: none;
}

/* Paper stack order
#p1 {
  z-index: 3;
}

#p2 {
  z-index: 2;
}

#p3 {
  z-index: 1;
}
*/

@media (max-width: 768px) {
    /* Diary */
    .diary {
        position: relative;
        width: 350px;
        height: 600px;
    }

    /* Controller buttons */
    button {
        border: none;
        cursor: pointer;
        margin: 10px;
    }
}
</style>
