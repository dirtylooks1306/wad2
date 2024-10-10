<template>
	<div
		id="carouselExampleControls"
		class="carousel slide"
		data-bs-ride="carousel"
	>
		<div class="carousel-inner">
			<div
				v-for="(item, index) in items"
				:key="index"
				:class="['carousel-item', { active: index === 0 }]"
			>
				<div class="container">
					<div class="row">
						<div class="col-md-1"></div>
						<div
							class="col-md-5 d-flex justify-content-center align-items-center"
						>
							<img
								:src="item.image"
								class="d-block w-100 p-3"
								:alt="item.alt"
							/>
						</div>
						<div class="col-md-5 text-start mt-3">
							<div class="text-end">
								<button
									type="button"
									class="small-icon-button heart"
									@click="toggleIcon1"
								>
									<img
										:src="item.icon1"
										:class="{ active: icon1Active }"
									/>
								</button>
								<button
									type="button"
									class="small-icon-button bookmark"
									@click="toggleIcon2"
								>
									<img
										:src="item.icon2"
										:class="{ active: icon2Active }"
									/>
								</button>
							</div>
							<h3>{{ item.title }}</h3>
							<p>{{ item.description }}</p>
						</div>
						<div class="col-md-1"></div>
					</div>
				</div>
			</div>
		</div>
		<button
			class="carousel-control-prev"
			type="button"
			data-bs-target="#carouselExampleControls"
			data-bs-slide="prev"
		>
			<span class="carousel-control-prev-icon" aria-hidden="true"></span>
			<span class="visually-hidden">Previous</span>
		</button>
		<button
			class="carousel-control-next"
			type="button"
			data-bs-target="#carouselExampleControls"
			data-bs-slide="next"
		>
			<span class="carousel-control-next-icon" aria-hidden="true"></span>
			<span class="visually-hidden">Next</span>
		</button>
	</div>
</template>
<style scoped>
.carousel-item img {
	max-width: 100%;
	height: auto;
}

.small-icon-button img.active {
    filter: invert(17%) sepia(100%) saturate(7496%) hue-rotate(1deg) brightness(101%) contrast(107%);
    fill:red;
}

.small-icon-button.active {
  background-color: black; 
}


.carousel-inner {
	text-align: center;
}
</style>
<script>
export default {
	name: "Carousel",
	props: {
		items: {
			type: Array,
			required: true,
			default: () => [],
		},
	},
	data() {
		return {
			icon1Active: false,
			icon2Active: false,
		};
	},
	methods: {
		toggleIcon1() {
			this.icon1Active = !this.icon1Active;
		},
		toggleIcon2() {
			this.icon2Active = !this.icon2Active;
		},
	},
};
</script>
