<script setup>
import CustomHeader from "./CustomHeader.vue";
</script>
<template>
    <div class="row row-cols-xl-2 row-cols-lg-1 pt-1">
        <div class="col-xl-4 col-lg-12 py-2">
            <label for="name" class="col-form-label">Owner Name:</label>
            <input type="text" class="form-control" id="name" placeholder="Who does this diary belong to?" v-model="formData.name">
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
            <button type="submit" class="btn btn-primary" @click="submitEntry">Submit Entry</button>
        </div>
        <div class="col-4"></div>
    </div>
    <hr>
    <CustomHeader header="Add / Delete Diary"/> <!-- Form group to delete diaries from Firebase entirely -->
    <div class="row row-xl-cols-3 row-lg-cols-2">
        <div class="col-xl-6 col-lg-12">
            <label for="diaryName" class="col-form-label">Owner Name:</label>
            <input type="text" class="form-control" id="diaryName" placeholder="Who does this diary belong to?" v-model="diaryName">
        </div>
        <div class="col-xl-3 col-lg-6 mt-2 d-flex align-self-end justify-content-center">
            <br>
            <button type="button" class="btn btn-danger align-bottom" @click="deleteDiary">Delete Diary</button>
        </div>
        <div class="col-xl-3 col-lg-6 mt-2 d-flex align-self-end justify-content-center">
            <br>
            <button type="button" class="btn btn-success align-bottom" @click="addDiary">Add Diary</button>
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
        },
        emits: ['submitEntry', 'addDiary', 'deleteDiary'],
        data() {
            return {
                formData: {
                    name: "",
                    header: "",
                    date: this.currentDate(),
                    body: "",
			    },
                maxChars: 525,
                diaryName: "", //Diary to add or delete(if exists)
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
            },
            resetFormData() {
                this.formData =  {
                    name: "",
                    header: "",
                    date: this.currentDate(),
                    body: "",
			    };
            },
            addDiary() {
                this.$emit('addDiary', this.diaryName)
            },
            deleteDiary() {
                this.$emit('deleteDiary', this.diaryName)
            }
        }
    }
</script>

<style scoped>
label, button {
    font-family: "Cherry Bomb", sans-serif;
}
</style>