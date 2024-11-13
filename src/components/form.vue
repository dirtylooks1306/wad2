<template>
	<div class="form-group row p-1">
		<div class="col-md-1"></div>
		<label for="date" class="col-md-3 col-12 col-form-label">Date of record</label>
		<div class="col-md-8 col-12">
			<input type="date" class="form-control" id="date" v-model="formData.selectedDate" />
		</div>
	</div>
	<!-- <div class="form-group row p-1">
		<div class="col-md-1"></div>
		<label for="age" class="col-md-3 col-12 col-form-label">Current age</label>
		<div class="col-md-8 col-12">
			<select for="age" class="form-control" v-model="formData.selectedAge">
				<option value="0-2 months">0-2 months</option>
				<option value="2-4 months">2-4 months</option>
				<option value="4-6 months">4-6 months</option>
				<option value="6-9 months">6-9 months</option>
				<option value="9-12 months">9-12 months</option>
				<option value="12-18 months">12-18 months</option>
				<option value="18-24 months">18-24 months</option>
			</select>
		</div>
	</div> -->
	<div class="form-group row p-1">
		<div class="col-md-1"></div>
		<label for="date" class="col-md-3 col-12 col-form-label">Weight</label>
		<div class="col-md-8 col-12">
			<input type="number" class="form-control" id="weight" placeholder="11.4 kg" v-model="formData.selectedWeight" />
		</div>
	</div>
	<div class="form-group row p-1">
		<div class="col-md-1"></div>
		<label for="date" class="col-md-3 col-12 col-form-label">Height/ Length</label>
		<div class="col-md-8 col-12">
			<input type="number" class="form-control" id="date" placeholder="30 cm" v-model="formData.selectedHeight" />
		</div>
	</div>
	<div class="form-group row p-1">
		<div class="col-md-1"></div>
		<label for="remarks" class="col-md-3 col-12 col-form-label">Remarks</label>
		<div class="col-md-8 col-12">
			<textarea class="form-control" id="remarks" rows="2" placeholder="Notes here" v-model="formData.selectedRemarks"></textarea>
		</div>
	</div>
	<div class="row pt-3">
		<div class="col-md-4"></div>
		<div class="col-md-4 mb-3">
			<button type="submit" class="btn btn-primary" @click="submitForm">Submit</button>
		</div>
		<div class="col-md-4"></div>
	</div>
	<p v-if="errorMessage" class="error-message text-center">{{ errorMessage }}</p>
	
</template>

<script>
export default {
	name: "FormComponent",
    emits: ['submit'],
	data() {
		return {
			formData: {
				selectedDate: this.currentDate(),
				selectedSex: "male",
				selectedAge: "0-2 months",
				selectedWeight: "",
				selectedHeight: "",
				selectedRemarks: "",
			},
			errorMessage: "",
		};
	},
	methods: {
		currentDate() {
			const today = new Date();
			const day = String(today.getDate()).padStart(2, "0");
			const month = String(today.getMonth() + 1).padStart(2, "0");
			const year = today.getFullYear();
			return `${year}-${month}-${day}`;
		},
		submitForm() {
			if (!this.formData.selectedWeight || !this.formData.selectedHeight) {
				this.errorMessage = "Please fill in both the Weight and Height fields.";
				setTimeout(() => {
					this.errorMessage = "";
				}, 1000);
				return;
			}
            this.$emit("submit", this.formData);
            this.resetFormData();
		},
        resetFormData() { // reset all values
            this.formData = {
                selectedDate: this.currentDate(),
                selectedSex: "male",
                selectedAge: "0-2 months",
                selectedWeight: "",
                selectedHeight: "",
                selectedRemarks: "",
            };
        },
	},
};
</script>

<style scoped>
.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}
</style>
