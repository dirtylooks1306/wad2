<template>
	<header>
		<div class="jumbotron header_class">
			<div class="row">
				<div class="col-md-6">
					<h1>
                        <span class="line-1">Empowering Parents</span>
                        <span class="line-2">Nurturing Futures</span>
                    </h1>
                    <button class="btn btn-primary">Get Started</button>
				</div>
				<div class="col-md-6">
					<img src="../assets//new.svg" alt="baby" />
				</div>
			</div>
		</div>
	</header>

    <div class="journey-title">
        <div class="line"></div>
        <h2>START YOUR JOURNEY</h2>
    </div>
     <!-- BS carousel: start --> 
     <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel"> 
         <div class="carousel-inner"> 
             <div class="carousel-item active"> 
                 <img src="..." class="d-block w-100" alt="..."> 
             </div> 
             <div class="carousel-item"> 
                 <img src="..." class="d-block w-100" alt="..."> 
             </div> 
             <div class="carousel-item"> 
                 <img src="..." class="d-block w-100" alt="..."> 
             </div> 
         </div> 
         <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev"> 
             <span class="carousel-control-prev-icon" aria-hidden="true"></span> 
             <span class="visually-hidden">Previous</span> 
         </button> 
         <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">  
             <span class="carousel-control-next-icon" aria-hidden="true"></span> 
             <span class="visually-hidden">Next</span> 
         </button> 
     </div> 
     <!-- BS carousel: end --> 
    

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
h1 {
    text-align: center; 
    font-size: 32px; 
}

h1 .line-1, h1 .line-2 {
    display: block;
}

h1 .line-2 {
    margin-top: 10px;
}

.header_class {
    color:#FF9689;
    padding: 20px;
    font-family: 'Cherry Bomb', sans-serif;
}

.journey-title h2 {
	font-family: 'Cherry Bomb', sans-serif;
	color: #FF9689;
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
