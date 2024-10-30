<template>
    <div class="row row-cols-xl-2 row-cols-lg-1 pt-5">
        <div class="col-xl-6 col-lg-12 py-2">
            <label for="header" class="col-form-label">Entry Header:</label>
            <input type="text" class="form-control" id="header" v-model="formData.header">
        </div>
        <div class="col-xl-6 col-lg-12 py-2">
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
    
</template>
<script>
    export default {
        name: 'DiaryForm',
        props: {
            entryData: Object,
        },
        emits: ['submitEntry'],
        data() {
            return {
                formData: {
                    header: "",
                    date: this.currentDate(),
                    body: "",
			    },
                maxChars: 525,
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
                    header: "",
                    date: this.currentDate(),
                    body: "",
			    };
            }
        }
    }
</script>

<style scoped>
label {
    font-family: "Cherry Bomb", sans-serif;
}
</style>