<template>
	<div class="form-group row p-1">
		<div class="col-md-1"></div>
		<label for="date" class="col-md-3 col-12 col-form-label">Date of record</label>
		<div class="col-md-8 col-12">
			<input type="date" class="form-control" id="date" v-model="formData.selectedDate" />
		</div>
	</div>
	<div class="form-group row p-1">
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
	</div>
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
	<div class="form-group row ps-1">
		<div class="col-md-1"></div>
		<label for="steps" class="col-md-3 col-12 col-form-label">First Steps?</label>
		<div class="col-md-8 col-12 pt-2">
			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="steps" id="yesSteps" value="yes" v-model="formData.selectedSteps" />
				<label class="form-check-label" for="inlineRadio1">Yes</label>
			</div>
			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="steps" id="noSteps" value="no" />
				<label class="form-check-label" for="inlineRadio2">No</label>
			</div>
		</div>
	</div>
	<div class="form-group row ps-1">
		<div class="col-md-1"></div>
		<label for="words" class="col-md-3 col-12 col-form-label">First Words?</label>
		<div class="col-md-8 col-12 pt-2">
			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="words" id="yesWords" value="yes" v-model="formData.selectedWords" />
				<label class="form-check-label" for="inlineRadio1">Yes</label>
			</div>
			<div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="words" id="noWords" value="no" />
				<label class="form-check-label" for="inlineRadio2">No</label>
			</div>
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
		<div class="col-md-4">
			<button type="submit" class="btn btn-primary" @click="submitForm">Submit</button>
		</div>
		<div class="col-md-4"></div>
	</div>
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
				selectedSteps: "",
				selectedWords: "",
				selectedRemarks: "",
			},
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
                selectedSteps: "",
                selectedWords: "",
                selectedRemarks: "",
            };
        },
	},
};
</script>
