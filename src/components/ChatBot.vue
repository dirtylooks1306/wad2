<script setup>
import { ref } from "vue";
import {
	db,
	collection,
	addDoc,
	query,
	orderBy,
	onSnapshot,
	where,
	getDocs,
	doc,
} from "../firebaseConfig.js";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
	faWindowMinimize,
	faTimes,
	faExpand,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";


library.add(faWindowMinimize, faTimes, faExpand);
const props = defineProps({
	userId: {
		type: String,
		required: true,
	},
    defaultQuestions: {
        type: Array,
        required: true,
    },
});
const localDefaultQuestions = ref([...props.defaultQuestions]);
const showModal = ref(false);
const isMinimized = ref(false);
const userQuestion = ref("");
const chatMessages = ref([]);


const toggleModal = () => {
	showModal.value = !showModal.value;
};
const toggleMinimize = () => {
	isMinimized.value = !isMinimized.value;
};


const handleQuestion = async () => { //submit qns
	if (userQuestion.value.trim() !== "") {
        const messagesRef = collection(
            db,
            "users",
            props.userId,
            "messages"
        );

        // Add the message to Firestore
        const docRef = await addDoc(messagesRef, {
            prompt: userQuestion.value,
            timestamp: new Date()
        });
        const parentMessageId = docRef.id;
        chatMessages.value.push({
            id: parentMessageId,
            prompt: userQuestion.value,
            responses: [],
        });
        userQuestion.value = "";
        listenForResponse(parentMessageId);
	}
};
const sendDefaultMessage = (question) => {
    userQuestion.value = question;
    handleQuestion();
    localDefaultQuestions.value = [];
};

const listenForResponse = (parentMessageId) => {
	const messageDocRef = doc(
		db,
		"users",
		props.userId,
		"messages",
		parentMessageId
	);

	const unsubscribe = onSnapshot(messageDocRef, (docSnapshot) => {
		if (docSnapshot.exists()) {
			const messageData = docSnapshot.data();
            localDefaultQuestions.value = [];
			if (messageData.response) {
				const existingMessage = chatMessages.value.find(
					(msg) => msg.id === parentMessageId
				);
				if (existingMessage) {
					existingMessage.response = messageData.response;
				} else {
					chatMessages.value.push({
						id: parentMessageId,
						prompt: messageData.prompt,
						response: messageData.response,
					});
				}
			}
		} else {
			console.log("Message not found.");
		}
	});

	return unsubscribe;
};
</script>

<template>
	<button class="chatbot-button" @click="toggleModal">
		<img
			src="../assets/icons/chat-bot.svg"
			alt="Chatbot"
			class="chatbot-icon"
		/>
		<span class="tooltip">Cradle Chat</span>
	</button>

	<div
		v-if="showModal"
		class="chatbot-modal"
		:class="{ minimized: isMinimized }"
	>
		<div class="chatbot-modal-header">
			<span>Cradle Chat</span>
			<div class="modal-controls">
				<button @click="toggleMinimize" class="control-button">
					<span>
						<font-awesome-icon
							:icon="
								isMinimized
									? ['fas', 'expand']
									: ['fas', 'window-minimize']
							"
						/>
					</span>
				</button>
				<button @click="showModal = false" class="control-button">
					<font-awesome-icon :icon="['fas', 'times']" />
				</button>
			</div>
		</div>

		<div v-if="!isMinimized" class="chatbot-modal-content">
			<div class="chat-content">
                <div v-for="message in chatMessages" :key="message.id" class="message-container">
                    <!-- User Message aligned to the right -->
                    <div v-if="message.prompt" class="message user-message">
                    <p><strong>You:</strong> {{ message.prompt }}</p>
                    </div>

                    <!-- Bot Message aligned to the left -->
                    <div v-if="message.response" class="message bot-message">
                    <p><strong>Cradle Chat:</strong> {{ message.response }}</p>
                    </div>
                </div>
			</div>
            <div class="default-questions">
                <button 
                v-for="(question, index) in localDefaultQuestions" 
                :key="index" 
                @click="sendDefaultMessage(question)"
                class="question-button"
                >
                {{ question }}
                </button>
            </div>
			<div class="chatbot-input">
				<input
					type="text"
					placeholder="Ask a question..."
					v-model="userQuestion"
					@keyup.enter="handleQuestion"
				/>
				<button @click="handleQuestion" class="send-button">
					Send
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* ChatBot Button */
.chatbot-button {
	position: fixed;
	bottom: 20px;
	right: 20px;
	background-color: #FF9689;
	color: #fff;
	border: none;
	border-radius: 50%;
	width: 70px;
	height: 70px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
	cursor: pointer;
	transition: background-color 0.3s ease;
	z-index: 1000;
}

.chatbot-button:hover {
	background-color: #0056b3;
}

.chatbot-icon {
	width: 35px;
	height: 35px;
}

/* Tooltip */
.tooltip {
	visibility: hidden;
	position: absolute;
	bottom: 60px;
	right: 0;
	background-color: #333;
	color: #fff;
	text-align: center;
	padding: 10px 20px;
	border-radius: 8px;
	font-size: 16px;
	opacity: 0;
	letter-spacing: 1px;
	transition: opacity 0.3s ease, visibility 0.3s ease;
	white-space: nowrap;
	z-index: 1001;
}

.chatbot-button:hover .tooltip {
	visibility: visible;
	opacity: 1;
}

/* Modal Styles */
.chatbot-modal {
	position: fixed;
	bottom: 80px;
	right: 20px;
	width: 340px;
	height: 500px;
	background-color: #FBF4EB;
	border-radius: 8px;
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
	overflow: hidden;
	transition: height 0.3s ease;
	z-index: 1000;
	border: 1px solid #e0e0e0;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 0px 0px;
}

.chatbot-modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #FF9689; 
	color: #ffffff; 
	padding: 10px 15px;
	font-size: 16px;
	font-weight: bold;
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
	width: 100%; 
	box-sizing: border-box; 
}

.chatbot-modal-header span {
	display: flex;
	align-items: center;
	color: inherit; 
}

.modal-controls {
	display: flex;
	align-items: center;
	gap: 10px; /* Space between icons */
}

.control-button {
	background: none;
	border: none;
	color: inherit; /* Inherit color from the header */
	cursor: pointer;
	font-size: 16px;
	padding: 5px; /* Adds some padding around the icon for easier clicking */
	display: flex;
	align-items: center;
}

.chatbot-modal-content {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

.chat-content {
	padding: 15px;
	font-size: 14px;
	color: #333;
	overflow-y: auto;
	flex-grow: 1; /* Allows chat content to expand and scroll if needed */
}

/* Input Field */
.chatbot-input {
	display: flex;
	align-items: center;
	padding: 15px;
	border-top: 1px solid #e0e0e0;
	background-color: #f9f9f9;
}

.chatbot-input input {
	flex: 1;
	padding: 10px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
	margin-right: 10px;
}

.send-button {
	background-color: #6FCF97;
	color: #fff;
	border: none;
	padding: 10px 15px;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
}

.send-button:hover {
	background-color: #0056b3;
}

/* Minimized State */
.chatbot-modal.minimized {
	height: 50px;
}

.message-container {
  display: flex;
  flex-direction: column;
  margin: 10px 0;
}

/* User message aligned to the right */
.user-message {
  align-self: flex-end;
  background-color: #d1f7c4; /* Light green */
  color: #333;
  padding: 10px;
  border-radius: 10px 10px 0 10px;
  max-width: 70%;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  text-align: left; /* Optional for text alignment within the bubble */
  float: right;
  margin-top: 6px;
  margin-bottom: 15px;
}

/* Bot message aligned to the left */
.bot-message {
  align-self: flex-start;
  background-color: #f1f1f1; /* Light gray */
  color: #333;
  padding: 10px;
  border-radius: 10px 10px 0px 10px;
  max-width: 70%;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  text-align: left; /* Optional for text alignment within the bubble */
  float:left;
}

.default-questions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap; /* Prevent wrapping to a new line */
  overflow-x: auto; /* Allow horizontal scrolling */
}

.question-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap; 
}

.question-button:hover {
  background-color: #0056b3;
}


</style>
