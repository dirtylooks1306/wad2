<template>
	<header>
		<div class="jumbotron header_class">
			<div class="row">
				<div class="col-md-6">
					<h1>Welcome to CradleCare</h1>
					<p>Your go-to platform for baby care</p>
				</div>
				<div class="col-md-6">
					<img src="../assets//new.svg" alt="baby" />
				</div>
			</div>
		</div>
	</header>

	<section class="intro">
		<h2>Why CradleCare?</h2>
		<p>
			We provide all the tools and resources you need to raise your baby
			confidently.
		</p>
	</section>

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

	<footer>
		<p>CradleCare © 2024</p>
	</footer>
</template>

<script>
export default {
	name: "HomePage",
};
</script>

<style scoped>
.header_class {
    color:#FF9689;
    padding: 20px;
    font-family: 'Cherry Bomb', sans-serif;
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
