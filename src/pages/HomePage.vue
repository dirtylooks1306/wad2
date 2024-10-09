<script setup>
import CustomHeader from "../components/CustomHeader.vue";
</script>
<template>
	<header>
		<div class="jumbotron header_class">
			<div class="row">
				<div class="col-md-6">
						<span class="line-1 title-class">Empowering Parents</span><br>
						<span class="line-2 title-class">Nurturing Futures</span><br>
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
			<span class="title-class">TRENDING ARTICLES</span>
			<!-- BS carousel: start -->
			<div
				id="carouselExampleControls"
				class="carousel slide"
				data-bs-ride="carousel"
			>
				<div class="carousel-inner">
					<div class="carousel-item active">
						<div class="container">
							<div class="row">
								<div class="col-md-1"></div>
								<div
									class="col-md-5 d-flex justify-content-center align-items-center"
								>
									<img
										src="../assets/placeholder.svg"
										class="d-block w-100 p-3"
										alt="Descriptive Alt Text"
									/>
									<!-- Change this img -->
								</div>
								<div class="col-md-5">
									<h3>Title 1</h3>
									<p>
										Lorem ipsum dolor sit amet, consectetur
										adipiscing elit. Maecenas pretium mi at
										tincidunt accumsan. Praesent cursus
										elementum mattis. Nunc a metus quis nibh
										sagittis gravida.
									</p>
								</div>
								<div class="col-md-1"></div>
							</div>
						</div>
					</div>

					<div class="carousel-item">
						<div class="container">
							<div class="row">
								<div class="col-md-1"></div>
								<div
									class="col-md-5 d-flex justify-content-center align-items-center"
								>
									<img
										src="../assets/placeholder.svg"
										class="d-block w-100 p-3"
										alt="Descriptive Alt Text"
									/>
									<!-- Change this img -->
								</div>
								<div class="col-md-5">
									<h3>Title 2</h3>
									<p>
										Lorem ipsum dolor sit amet, consectetur
										adipiscing elit. Maecenas pretium mi at
										tincidunt accumsan. Praesent cursus
										elementum mattis. Nunc a metus quis nibh
										sagittis gravida.
									</p>
								</div>
								<div class="col-md-1"></div>
							</div>
						</div>
					</div>
					<div class="carousel-item">
						<div class="container">
							<div class="row">
								<div class="col-md-1"></div>
								<div
									class="col-md-5 d-flex justify-content-center align-items-center"
								>
									<img
										src="../assets/placeholder.svg"
										class="d-block w-100 p-3"
										alt="Descriptive Alt Text"
									/>
									<!-- Change this img -->
								</div>
								<div class="col-md-5">
									<h3>Title 3</h3>
									<p>
										Lorem ipsum dolor sit amet, consectetur
										adipiscing elit. Maecenas pretium mi at
										tincidunt accumsan. Praesent cursus
										elementum mattis. Nunc a metus quis nibh
										sagittis gravida.
									</p>
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
					<span
						class="carousel-control-prev-icon"
						aria-hidden="true"
					></span>
					<span class="visually-hidden">Previous</span>
				</button>
				<button
					class="carousel-control-next"
					type="button"
					data-bs-target="#carouselExampleControls"
					data-bs-slide="next"
				>
					<span
						class="carousel-control-next-icon"
						aria-hidden="true"
					></span>
					<span class="visually-hidden">Next</span>
				</button>
			</div>
			<!-- BS carousel: end -->
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
	<div class="secondary-background">
		<section class="features">
			<h2>Features</h2>
			<div class="feature-card">
				<h3>Vaccine Tracker</h3>
				<p>Track your baby's vaccination schedule with ease.</p>
			</div>
			<div class="feature-card">
				<h3>Growth Tracker</h3>
				<p>
					Monitor your baby's growth and compare it against national
					averages.
				</p>
			</div>
			<div class="feature-card">
				<h3>Forum & Safety Tips</h3>
				<p>Connect with other parents and share your experiences.</p>
			</div>
		</section>
	</div>
	<footer>
		<p>CradleCare © 2024</p>
	</footer>
</template>

<script>
export default {
	name: "homePage",
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
	padding: 20px;
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
