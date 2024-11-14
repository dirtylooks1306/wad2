<script setup>
import CustomHeader from "./CustomHeader.vue";
</script>
<template>
  <div class="row row-cols-xl-2 row-cols-lg-1 form-field justify-content-center">
        <div class="col-xl-6 col-lg-12 submit-entry" v-if="diaries.length > 0">
            <CustomHeader header="SUBMIT A NEW ENTRY"/>
            <div class="row pt-1">
                <span id="submission" v-if="owner">Submitting an entry for: <span id="ownerName">{{ owner }}</span></span>
                <div class="col-xl-6 col-lg-12 py-2">
                    <label for="header" class="col-form-label">Entry Header:</label>
                    <input type="text" class="form-control" id="header" v-model="formData.header">
                </div>
                <div class="col-xl-6 col-lg-12 py-2">
                    <label for="date" class="col-form-label">Entry Date:</label>
                    <input type="date" class="form-control" id="date" v-model="formData.date">
                </div>
            </div>
            <div class="col-6">
                <label for="imageFile" class="col-form-label">Select an Image:</label>
                <input type="file" id="imageFile" class="form-control" @change="setImage">
            </div>
            <div class="col-12 py-2">
                <label for="body" class="col-form-label">Entry Body:</label>
                <textarea class="form-control" id="body" rows="5" maxlength="360" 
                    placeholder="Write something memorable!" 
                    v-model="formData.body" 
                > <!-- Set max limit of characters for entry so that content does not overflow out of diary page -->
                </textarea>
                {{ charCount }}/{{ maxChars }}
            </div>
            <div class="row py-3">
                <div class="col-4"></div>
                <div class="col-4 d-flex justify-content-center">
                    <button type="submit" class="btn btn-primary" @click="submitEntry"><span>Submit Entry</span></button>
                </div>
                <div class="col-4"></div>
            </div>
            <span class="error-text d-flex justify-content-center" v-if="entryError">{{ entryError }}</span> <!-- Message to show successful entry  -->
            <span class="error-text d-flex justify-content-center" v-if="diaryError">{{ diaryError }}</span> <!-- Message to show success/error message for adding/deleting diaries -->
        </div>
    </div>
</template>
<script>
    export default {
        isWideEnough: window.innerWidth >= 992,
        name: 'DiaryForm',
        components: {
            CustomHeader,
        },
        props: {
            entryData: Object,
            diaries: Array,
            children: Array,
            entryError: String,
            diaryError: String,
            owner: String,
        },
        emits: ['submitEntry', 'deleteDiary'],
        data() {
            return {
                formData: {
                    name: "",
                    header: "",
                    date: this.currentDate(),
                    imageURL: null,
                    body: "",
			    },
                maxChars: 360,
            }
        },
        computed: {
            charCount() {
                return this.formData.body.length;
            }
        },
        methods: {
            currentDate() {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, "0");
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const year = today.getFullYear();
                return `${year}-${month}-${day}`;
            },
            submitEntry() {
                this.$emit('submitEntry', this.formData);
                this.resetFormData();
                this.formData.name = this.owner;
            },
            resetFormData() {
                this.formData =  {
                    name: "",
                    header: "",
                    date: this.currentDate(),
                    imageURL: null,
                    body: "",
			    };
            },
            setImage() {
                const fileInput = document.getElementById('imageFile');
                this.formData.imageURL = fileInput.files[0];
            },
        },
        watch: {
            owner(newOwner) {
                this.formData.name = newOwner; // Watch for changes in owner variable when user changes collapsibles
            }
        },
        mounted() {
            //Set formData.name initially if owner is set when component mounts
            if (this.owner) {
                this.formData.name = this.owner;
            }
        }
    }
</script>

<style scoped>
button {
    font-family: "Cherry Bomb", sans-serif;
}

label {
    font-family: sans-serif;
}

#ownerName {
    text-decoration: underline;
    color: #efba1d;
    text-decoration-color: #ff9689;
    font-weight: bold;
}

#submission {
    font-size: 25px;
    font-family: sans-serif;
}
/* Form button animations */
button {
	font-family: "Cherry Bomb", sans-serif;
}

button span {
	cursor: pointer;
	display: inline-block;
	position: relative;
	transition: 0.5s;
}

button span:after {
	content: "\00bb"; /* Double arrow */
	position: absolute;
	opacity: 0;
	top: 0;
	right: -20px;
	transition: 0.5s;
}

#add span:after {
    content: "\02795"; /* Plus Sign */
}

#delete span:after {
    content: "\2796"; /* Minus Sign */
}

button:hover span {
	padding-right: 25px;
}

button:hover span:after {
	opacity: 1;
	right: 0;
}
/* Form CSS properties */
.form-field {
    display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.submit-entry, .addDeleteDiary {
    background-color: #eed4d4;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
	flex: 1 1 40%;
}

/* Error Message Styling */
.error-text {
    font-size: 20px;
    font-family: "Cherry Bomb", sans-serif;
    color: black;
    animation: blink 1s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
      opacity: 0;
  }
  100% {
      opacity: 1;
  }
}

@media (max-width: 768px) {
    .form-field {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 50px; /* Create space for error message to appear on mobile screens */
    }
}
</style>