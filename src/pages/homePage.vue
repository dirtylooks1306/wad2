<script setup>
import CustomHeader from "../components/CustomHeader.vue";
import Carousel from "../components/Carousel.vue";
import NavBar from "../components/navBar.vue";
</script>
<template>
	<NavBar />
	<header>
		<div class="jumbotron header_class">
			<div class="row">
				<div class="col-md-6">
					<div class="title-class">
						<span class="line-1">Empowering Parents</span><br />
						<span class="line-2">Nurturing Futures</span>
					</div>
					<br />
					<button class="btn btn-primary">Get Started</button>
				</div>
				<div class="col-md-6">
					<img src="../assets/HomeMasthead.svg" alt="baby" />
				</div>
			</div>
		</div>
	</header>
	<div class="secondary-background p-3">
		<div class="container-fluid">
			<CustomHeader header="Article" />
			<h2>TRENDING ARTICLES</h2>
			<Carousel :items="carouselItems" />
		</div>
	</div>

	<div class="container-fluid p-3">
		<CustomHeader header="GrowthTracker" />
		<div class="row">
			<div class="col-md-1"></div>
			<div class="col-md-4">
				<div class="title-class">
					Begin Your Little One's Journey to Healthy Growth!
				</div>
				<p>
					Stay informed and engaged—check out the Growth Tracker to
					celebrate every milestone!
				</p>
				<a href="#"
					><button class="btn btn-primary">GrowthTracker</button></a
				>
			</div>
			<div class="col-md-6">
				<img
					src="../assets/homepageBaby.jpg"
					alt="Growth Tracker"
					class="carousel-image"
				/>
			</div>
			<div class="col-md-1"></div>
		</div>
	</div>

	<div class="container-fluid secondary-background p-3">
		<CustomHeader header="Forum" />
	</div>
	<footer>
		<p>CradleCare © 2024</p>
	</footer>
</template>

<script>
export default {
	name: "homePage",
	components: {
		CustomHeader,
		Carousel,
	},
	data() {
		return {
			carouselItems: [
				{
					title: "Title 1",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pretium mi at tincidunt accumsan.",
					image: "src/assets/placeholder.svg",
					alt: "Descriptive Alt Text",
					icon1: "src/assets/heart.svg",
					icon2: "src/assets/bookmark.svg",
				},
				{
					title: "Title 2",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pretium mi at tincidunt accumsan.",
					image: "/src/assets/placeholder.svg",
					alt: "Descriptive Alt Text",
					icon1: "src/assets/heart.svg",
					icon2: "src/assets/bookmark.svg",
				},
				{
					title: "Title 3",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pretium mi at tincidunt accumsan.",
					image: "src/assets/placeholder.svg",
					alt: "Descriptive Alt Text",
					icon1: "src/assets/heart.svg",
					icon2: "src/assets/bookmark.svg",
				},
			],
		};
	},
};
</script>

<style scoped>
.carousel-image {
	width: 500px;
	height: 400px;
}
.secondary-background {
	background-color: #eed4d4;
	width: 100%;
	display: flex;
}
h1,
h2 {
	text-align: center;
	font-size: 32px;
	color: #ff9689;
	font-family: "Cherry Bomb", sans-serif;
}

h1 .line-1,
h1 .line-2 {
	display: block;
}

h1 .line-2 {
	margin-top: 10px;
}

.header_class {
	color: #ff9689;
	font-family: "Cherry Bomb", sans-serif;
}
img {
	max-width: 100%;
	height: auto;
}

.row {
	display: flex;
	align-items: center;
}

.intro,
.features {
	margin: 20px 0;
}

.feature-card {
	display: inline-block;
	border: 1px solid #ddd;
	padding: 10px;
	margin: 10px;
	width: 30%;
}

footer {
	margin-top: 40px;
}
</style>
