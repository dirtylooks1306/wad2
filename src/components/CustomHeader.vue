<!-- components/CustomHeader.vue -->
<template>
	<div class="parent">
		<div class="header"></div>
		<span class="header-text">{{ header }}</span>
	</div>
</template>

<script>
export default {
	props: {
		header: String,
	},
};
</script>

<style scoped>
.header {
	background-color: #ff9689;
	width: 90px;
	padding: 1px 2px;
}

.header-text {
	color: #efba1d;
	text-align: left;
	display: block;
	font-family: "Cherry Bomb", sans-serif;
	text-transform: uppercase;
	font-weight: bold;
	font-size: 16px;
	text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;
}
.parent {
	padding: 10px 0px;
}
</style>
