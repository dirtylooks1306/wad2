<script setup>
import Chart from "chart.js/auto";
import { ref, watch, onMounted, defineProps, nextTick } from "vue";
import { collection, getDocs, db } from "../firebaseConfig";

const props = defineProps({
	posts: Array,
	gender: String,
});

const activeChart = ref("WeightGraph");
const weightChart = ref(null);
const heightChart = ref(null);

const globalWeightArray = ref([]);
const globalHeightArray = ref([]);


const buttonDisabled = ref(false); // State to disable buttons temporarily

const setActiveChart = async (chart) => {
    if (buttonDisabled.value || activeChart.value === chart) return; // Prevent double-clicking or redundant actions

    activeChart.value = chart;
    buttonDisabled.value = true; // Disable buttons
    // Set a timeout to re-enable the buttons after a short delay (e.g., 400ms)
    setTimeout(() => {
        buttonDisabled.value = false;
    }, 400);

    // Create or refresh the chart here based on the selected chart type
    if (chart === "WeightGraph") {
        createChartWeight();
    } else if (chart === "HeightGraph") {
        createChartHeight();
    }
};



const fetchGlobalDataByGender = async () => {
    if (!props.gender) {
        return;
    }
	const globalHeightRef = collection(
		db,
		"globalBabyData",
		props.gender,
		"height"
	);
	const globalWeightRef = collection(
		db,
		"globalBabyData",
		props.gender,
		"weight"
	);

	// Fetch global height data
	const snapshotChartHeight = await getDocs(globalHeightRef);
	globalHeightArray.value = snapshotChartHeight.docs.map((doc) => ({
		id: doc.id,
		age: doc.data().age,
		...doc.data(),
	}));

	// Fetch global weight data
	const snapshotChartWeight = await getDocs(globalWeightRef);
	globalWeightArray.value = snapshotChartWeight.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));
};

const createChartWeight = () => {
    if (!props.posts.length || !props.posts[props.posts.length - 1]?.age) {
        return; // Skip creating the chart if data is not available
    }
	const canvas = document.getElementById("babyGrowthWeightChart");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (weightChart.value) weightChart.value.destroy();


	const dateData = props.posts.map((post) => post.date);
	const weightData = props.posts.map((post) => post.weight);

	const averageWeight = getAverageData("weight");
	const averageWeightArray = Array.from(
		{ length: props.posts.length },
		() => averageWeight
	);
	let currentAge = props.posts[props.posts.length - 1].age;
	weightChart.value = new Chart(ctx, {
		type: "line",
		data: {
			labels: dateData,
			datasets: [
				{
					label: "Weight (in kg)",
					data: weightData,
					borderColor: "red",
					fill: false,
				},
				{
					label: `Avg Weight at ${currentAge}`,
					data: averageWeightArray,
					borderColor: "green",
					fill: false,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true, // Allows the chart to fill its container
			plugins: {
				legend: {
					position: "top",
				},
				title: {
					display: true,
					text: "Weight Over Time",
				},
			},
			scales: {
				x: {
					beginAtZero: true,
				},
				y: {
					beginAtZero: true,
					min: 0,
					ticks: {
						stepSize: 1, // Adjust this according to your data range
					},
				},
			},
			layout: {
				padding: 20, // Optional padding around the chart
			},
		},
	});
};

const createChartHeight = () => {
    if (!props.posts.length || !props.posts[props.posts.length - 1]?.age) {
        return; // Skip creating the chart if data is not available
    }
    const canvas = document.getElementById("babyGrowthHeightChart");
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (heightChart.value) heightChart.value.destroy();

	const dateData = props.posts.map((post) => post.date);
	const heightData = props.posts.map((post) => post.height);

	const averageHeight = getAverageData("height");
	const averageHeightArray = Array.from(
		{ length: props.posts.length },
		() => averageHeight
	);

	let currentAge = props.posts[props.posts.length - 1].age;
	heightChart.value = new Chart(ctx, {
		type: "line",
		data: {
			labels: dateData,
			datasets: [
				{
					label: "Height (in cm)",
					data: heightData,
					borderColor: "blue",
					fill: false,
				},
				{
					label: `Avg Height at ${currentAge}`,
					data: averageHeightArray,
					borderColor: "green",
					fill: false,
				},
			],
		},
        options: {
			responsive: true,
			maintainAspectRatio: true, // Allows the chart to fill its container
			plugins: {
				legend: {
					position: "top",
				},
				title: {
					display: true,
					text: "Weight Over Time",
				},
			},
			scales: {
				x: {
					beginAtZero: true,
				},
				y: {
					beginAtZero: true,
					min: 0,
					ticks: {
						stepSize: 1, // Adjust this according to your data range
					},
				},
			},
			layout: {
				padding: 20, // Optional padding around the chart
			},
		},
	});
};

const getAverageData = (type) => {
	const ageRangeMapping = {
		"0-2 months": 1,
		"2-4 months": 2,
		"4-6 months": 3,
		"6-9 months": 4,
		"9-12 months": 5,
		"12-18 months": 6,
		"18-24 months": 7,
	};
	let currentAge = props.posts[props.posts.length - 1].age;   
	const mappedIndex = ageRangeMapping[currentAge];
	if (type === "weight") return globalWeightArray.value[0]?.[mappedIndex];
	if (type === "height") return globalHeightArray.value[0]?.[mappedIndex];
};



onMounted(async () => {
    if (props.gender) {
        await fetchGlobalDataByGender();
    }
    if (props.posts.length && props.posts[props.posts.length - 1].age) {
        createChartWeight();
        createChartHeight();
    }
    setActiveChart(activeChart.value);
});

watch(
    [() => props.gender, () => props.posts],
    async ([newGender, newPosts], [oldGender, oldPosts]) => {
        if (newGender && newGender !== oldGender) {
            await fetchGlobalDataByGender();
        }
        if (newPosts.length && newPosts !== oldPosts) {
            createChartWeight();
            createChartHeight();
        }
    },
    { immediate: true, deep: true }
);


</script>

<template>
    <div class="chart-container">
        <canvas
            id="babyGrowthWeightChart"
            v-show="activeChart === 'WeightGraph'"
        ></canvas>
        <canvas
            id="babyGrowthHeightChart"
            v-show="activeChart === 'HeightGraph'"
        ></canvas>
    </div>

    <ul class="d-md-flex desktop-tabs mt-3">
        <li
            :class="{ selected: activeChart === 'WeightGraph' }"
            @click="setActiveChart('WeightGraph')"
        >
            <a href="#WeightGraph" :class="{ 'disabled-link': buttonDisabled }">Weight</a>
        </li>
        <li
            :class="{ selected: activeChart === 'HeightGraph' }"
            @click="setActiveChart('HeightGraph')"
        >
            <a href="#HeightGraph" :class="{ 'disabled-link': buttonDisabled }">Height</a>
        </li>
    </ul>
    <p class="disclaimer-text">
        Data might take a moment to load. If it doesn't appear, try switching tabs.
    </p>
</template>

<style scoped>
.chart-container {
	background-color: #ffffff;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
	margin-bottom: 20px;
	overflow: hidden;
    width: 100%;
    height:auto;
    margin: auto;
}
.chart-container canvas {
	width: 100% !important; /* Ensures the canvas takes the full width of its container */
	height: auto !important; /* Maintains aspect ratio */
	max-width: 100%; /* Prevents overflow */
}
/* Tabs for Chart Selection */
.desktop-tabs {
	display: flex;
	gap: 10px;
	margin-top: 15px;
}

.desktop-tabs li {
	list-style-type: none;
	padding: 10px 20px;
	border-radius: 20px;
	background-color: #e9ecef;
	cursor: pointer;
	transition: background-color 0.3s;
}

.desktop-tabs li:hover,
.desktop-tabs li.selected {
	background-color: #9e9e9e;
	color: white;
	font-weight: bold;
}	

/* Refresh Button */
.refresh-button {
	background-color: #28a745;
	color: #fff;
	padding: 10px 20px;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	margin-top: 10px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.refresh-button:hover {
	background-color: #218838;
}
.disclaimer-text {
    color: red;
}

/* Responsive Design */
@media (max-width: 768px) {
	.form-and-charts {
		flex-direction: column;
	}

	.chart-container {
		max-height: 400px;
	}

	.desktop-tabs {
		flex-direction: column;
		align-items: center;
	}
}

</style>
