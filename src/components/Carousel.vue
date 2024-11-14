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
						<div class="col-md-5 d-flex justify-content-center align-items-center">
							<div style="width: 300px; height: 300px; overflow: hidden;">
								<img :src="item.image" class="d-block p-3 carousel-image" :alt="item.alt" />
							</div>
						</div>
						<div class="col-md-5 text-start mt-3 d-flex flex-column justify-content-between carousel-content">
							<div>
								<h3 class="carousel-title">{{ item.title }}</h3>
								<hr class="title-divider" />
								<p>{{ item.description }}</p>
							</div>
							
							<button class="btn btn-primary read-more-button" @click="$emit('item-click', item.id)">
								Read More
							</button>
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

<style scoped>
.carousel-item img {
	max-width: 100%;
	height: auto;
}

.carousel-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.carousel-title {
    font-family: "Cherry Bomb", sans-serif;
    font-size: 24px;
    color: #ff9689;
    text-align: left;
    margin-bottom: 10px;
}

.title-divider {
    border-top: 4px solid #ff9689;
    margin-bottom: 15px;
}

.carousel-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.read-more-button {
    font-family: "Cherry Bomb", sans-serif;
    font-size: 16px;
    color: #fff;
    align-self: flex-start;
    margin-top: auto;
}

.small-icon-button img.active {
    filter: invert(17%) sepia(100%) saturate(7496%) hue-rotate(1deg) brightness(101%) contrast(107%);
    fill: red;
}

.small-icon-button.active {
    background-color: black;
}

.carousel-inner {
	text-align: center;
}
</style>
