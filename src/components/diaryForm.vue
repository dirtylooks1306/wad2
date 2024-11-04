<script setup>
import CustomHeader from "./CustomHeader.vue";
</script>
<template>
    <div class="row row-cols-xl-2 row-cols-lg-1 pt-1">
        <div class="col-xl-4 col-lg-12 py-2">
            <label for="name" class="col-form-label">Owner Name:</label><br>
            <select id="name" class="form-select" aria-label="Default Select Example" v-model="formData.name">
                <option value="" selected>Select a Child</option>
                <option v-for="(diary, i) in diaries" :value="diary.id">{{ diary.id }}</option>
            </select>
        </div>
        <div class="col-xl-4 col-lg-12 py-2">
            <label for="header" class="col-form-label">Entry Header:</label>
            <input type="text" class="form-control" id="header" v-model="formData.header">
        </div>
        <div class="col-xl-4 col-lg-12 py-2">
            <label for="date" class="col-form-label">Entry Date:</label>
            <input type="date" class="form-control" id="date" v-model="formData.date">
        </div>
    </div>
    <div class="col-3">
        <label for="imageFile" class="col-form-label">Select an Image:</label>
        <input type="file" id="imageFile" ref="file" class="form-control" @change="setImage" accept=".pdf,.jpg,.jpeg,.png">
    </div>
    <div class="col-12 py-2">
        <label for="body" class="col-form-label">Entry Body:</label>
        <textarea class="form-control" id="body" rows="5" maxlength="525" 
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
    <hr>
    <CustomHeader header="Add / Delete Diary"/> <!-- Form group to delete diaries from Firebase entirely -->
    <div class="row row-xl-cols-2 row-lg-cols-1">
        <div class="col-xl-6 col-lg-12">
            <label for="newDiaryName" class="col-form-label">New Owner Name:</label><br>
            <select id="newDiaryName" class="form-select" aria-label="Default Select Example" v-model="newDiaryName">
                <option value="" selected>Select a Child</option>
                <option v-for="child of children" :value="child">{{ child }}</option> <!-- To Change based on user's children names -->
            </select>
        </div>
        <div class="col-xl-6 col-lg-12 mt-2 d-flex align-self-end justify-content-center">
            <button type="button" id="add" class="btn btn-success align-bottom w-50" @click="addDiary"><span>Add Diary</span></button>
        </div>
    </div>
    <div class="row row-xl-cols-2 row-lg-cols-1">
        <div class="col-xl-6 col-lg-12">
            <label for="existingDiaryName" class="col-form-label">Existing Owner Name:</label><br>
            <select id="existingDiaryName" class="form-select" aria-label="Default Select Example" v-model="existingDiaryName">
                <option value="" selected>Select a Child</option>
                <option v-for="(diary, i) in diaries" :value="diary.id">{{ diary.id }}</option>
            </select>
        </div>
        <div class="col-xl-6 col-lg-12 mt-2 d-flex align-self-end justify-content-center">
            <button type="button" id="delete" class="btn btn-danger align-bottom w-50" @click="deleteDiary"><span>Delete Diary</span></button>
        </div>
    </div>
    
</template>
<script>
    export default {
        name: 'DiaryForm',
        components: {
            CustomHeader,
        },
        props: {
            entryData: Object,
            diaries: Array,
            children: Array,
        },
        emits: ['submitEntry', 'addDiary', 'deleteDiary'],
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
                newDiaryName: "", //Diary to add
                existingDiaryName: "", //Diary to delete
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
                if (this.formData.name === '') {
                    alert("Name field cannot be empty!");
                }
                this.$emit('submitEntry', this.formData);
                this.resetFormData();
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
            addDiary() {
                if (this.newDiaryName === '') {
                    alert("New owner name must be selected!")
                }
                this.$emit('addDiary', this.newDiaryName)
            },
            deleteDiary() {
                if (this.existingDiaryName === '') {
                    alert("Existing owner name must be selected!")
                }
                this.$emit('deleteDiary', this.existingDiaryName)
            },
            setImage() {
                const fileInput = document.getElementById('imageFile');
                //console.log(fileInput.files); Debugging for file upload
                const reader = new FileReader();
                reader.onload = () => {
                    this.formData.imageURL = reader.result;
                }
                reader.readAsDataURL(fileInput.files[0]);
            }
        }
    }
</script>

<style scoped>
label, button {
    font-family: "Cherry Bomb", sans-serif;
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
</style>