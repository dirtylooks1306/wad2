<template>
  <div id="forum-bar" :class="{ 'mobile-view': isMobileView }">
    <input id="forum-toggle" type="checkbox" />
    <div id="forum-header"><a id="forum-title">Forum</a>
      <label for="forum-toggle"><i :class="iconClass" @click="toggleIcon"></i> </label>
      <hr />
    </div>
    <div id="forum-content">
      <router-link to="/forum/create-post">
        <div class="forum-button">
          <i class="fas fa-solid fa-plus"></i>
          <span>Create</span>
        </div>
      </router-link>
      <hr />
      <router-link to="/forum/trending">
        <div class="forum-button">
          <i class="fas fa-chart-line"></i>
          <span>Trending</span>
        </div>
      </router-link>
      <hr />
      <router-link to="/forum/new">
        <div class="forum-button">
          <i class="fas fa-solid fa-fire"></i>
          <span>New</span>
        </div>
      </router-link>
      <hr />
      <router-link to="/forum/saved">
        <div class="forum-button">
          <i class="fas fa-thumbtack"></i>
          <span>Saved</span>
        </div>
      </router-link>
      <hr />
      <router-link to="/forum/recently-viewed">
        <div class="forum-button">
          <i class="fas fa-solid fa-clock"></i>
          <span>History</span>
        </div>
      </router-link>
      <hr />
      <div id="forum-content-highlight"></div>
    </div>
    <input id="forum-footer-toggle" type="checkbox" />
    <div id="forum-footer">
      <router-link :to="`/forum/user/${userData.username}`">
        <div id="forum-footer-heading">
          <div id="forum-footer-avatar">
            <img :src="userData.profileimage" alt="Author profile" class="profile-image" />
          </div>
          
          <div id="forum-footer-titlebox">
            <span id="forum-footer-title">{{ userData.username }}</span>
            <!-- <span id="forum-footer-subtitle">{{ userData.role || 'user' }}</span> -->
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>

import { ref, onMounted, computed } from 'vue';
import { auth, db, doc, getDoc } from '../firebaseConfig.js';

export default {
  name: 'ForumSidebar',
  setup() {
    
    const userData = ref({
      username: 'Loading...',
      profileimage: 'default-profile.png', // Path to a default image
      role: 'user'
    });
    const isHamburger = ref(false);
    const fetchUserData = async () => {
      try {
        const currentUser = await auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            userData.value.username = data.username || 'Anonymous';
            userData.value.profileimage = data.profileimage || 'default-profile.png';
            userData.value.role = data.role || 'user';
          } else {
            console.error('User document not found');
          }
        } else {
          console.error('No user is currently logged in');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    const toggleIcon = () => {
      isHamburger.value = !isHamburger.value;
    };
    onMounted(() => {
      fetchUserData();
    });

    return {
      userData,
      isHamburger,
      toggleIcon,
      iconClass: computed(() => (isHamburger.value ? 'fas fa-bars' : 'fas fa-arrow-left'))
    };
  }
};
</script>

<style scoped>

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

/* Add other existing CSS styles for forum sidebar here */
#forum-toggle-burger {
  position: relative;
  width: 16px;
  height: 2px;
  background: #EED4D4;
  border-radius: 99px;
  transition: background 0.2s;
}
#forum-toggle-burger:before, #forum-toggle-burger:after {
  content: "";
  position: absolute;
  top: -6px;
  width: 10px;
  height: 2px;
  background: var(--forumbar-light-primary);
  border-radius: 99px;
  transform: translate(2px, 8px) rotate(30deg);
  transition: 0.2s;
}
#forum-toggle-burger:after {
  top: 6px;
  transform: translate(2px, -8px) rotate(-30deg);
}

#forum-content {
  margin: -16px 0;
  padding: 16px 0;
  position: relative;
  flex: 1;
  width: var(--forumbar-width);
  background: #EED4D4;
  box-shadow: 0 0 0 16px var(#EED4D4);
  direction: rtl;
  overflow-x: hidden;
  transition: width 0.2s;
}
#forum-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
#forum-content::-webkit-scrollbar-thumb {
  border-radius: 99px;
  background-color: #333333;
}

#forum-content-highlight {
  position: absolute;
  left: 16px;
  top: -70px;
  width: calc(100% - 16px);
  height: 54px;
  background: var(--forumbar-dark-secondary);
  background-attachment: fixed;
  border-radius: 16px 0 0 16px;
  transition: top 0.2s;
}
#forum-content-highlight:before, #forum-content-highlight:after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 100%;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: 16px 16px var(--background);
}
#forum-content-highlight:after {
  top: 100%;
  box-shadow: 16px -16px var(--background);
}

.forum-button {
  position: relative;
  margin-left: 16px;
  height: 54px;
  display: flex;
  align-items: center;
  direction: ltr;
  cursor: pointer;
  z-index: 1;
  transition: color 0.2s;
}
.forum-button span {
  transition: opacity 1s;
}
.forum-button .fas {
  transition: min-width 0.2s;
}
.forum-button:hover {
  background-color: #ff9689;
  border-radius: 10px 10px 10px 10px;
  color: #ffffff;
}

#forum-bar .fas {
  min-width: 3rem;
  text-align: center;
}

#forum-footer {
  position: relative;
  width: var(--forumbar-width);
  height: 54px;
  background: var(--forumbar-dark-secondary);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  z-index: 2;
  transition: width 0.2s, height 0.2s;
}

#forum-footer-heading {
  position: relative;
  width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
}

#forum-footer-avatar {
  position: relative;
  margin: 11px 0 11px 16px;
  left: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  transform: translate(0);
  transition: 0.2s;
}
#forum-footer-avatar img {
  height: 100%;
}

#forum-footer-titlebox {
  position: relative;
  margin-left: 16px;
  width: 10px;
  display: flex;
  flex-direction: column;
  transition: opacity 1s;
}

#forum-footer-subtitle {
  color: var(--forumbar-light-secondary);
  font-size: 0.6rem;
}

#forum-footer-toggle:checked + #forum-footer {
  height: 30%;
  min-height: 54px;
}
#forum-footer-toggle:checked + #forum-footer label[for=forum-footer-toggle] {
  transform: rotate(180deg);
}

#forum-toggle:checked ~ #forum-bar {
  height: 80px; /* Change to desired collapsed height */
}

label[for=forum-footer-toggle] {
  position: absolute;
  right: 0;
  width: 3rem;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

#forum-footer-content {
  margin: 0 16px 16px 16px;
  border-top: solid 1px var(--forumbar-light-secondary);
  padding: 16px 0;
  color: var(--forumbar-light-secondary);
  font-size: 0.8rem;
  overflow: auto;
}
#forum-footer-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
#forum-footer-content::-webkit-scrollbar-thumb {
  border-radius: 99px;
  background-color: #333333;
}

#forum-toggle:checked ~ #forum-header {
  width: calc(var(--forumbar-width-min) - 16px);
}
#forum-toggle:checked ~ #forum-content, #forum-toggle:checked ~ #forum-footer {
  width: var(--forumbar-width-min);
}
#forum-toggle:checked ~ #forum-header #forum-title {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s;
}
#forum-toggle:checked ~ #forum-header label[for=forum-toggle] {
  left: calc(50% - 8px);
  transform: translate(-50%);
}
#forum-toggle:checked ~ #forum-header #forum-toggle-burger {
  background: black;
}
#forum-toggle:checked ~ #forum-header #forum-toggle-burger:before, #forum-toggle:checked ~ #forum-header #forum-toggle-burger::after {
  width: 16px;
  background: black;
  transform: translate(0, 0) rotate(0deg);
}
#forum-toggle:checked ~ #forum-content .forum-button span {
  opacity: 0;
  transition: opacity 0.1s;
}
#forum-toggle:checked ~ #forum-content .forum-button .fas {
  min-width: calc(100% - 16px);
}
#forum-toggle:checked ~ #forum-footer #forum-footer-avatar {
  margin-left: 0;
  left: 50%;
  transform: translate(-50%);
}
#forum-toggle:checked ~ #forum-footer #forum-footer-titlebox, #forum-toggle:checked ~ #forum-footer label[for=forum-footer-toggle] {
  opacity: 0;
  transition: opacity 0.1s;
  pointer-events: none;
}

#forum-bar {
  position: fixed;
  margin-top: 100px;
  left: 1vw;
  top: 1vw;
  z-index: 999;
  height: calc(80% - 1vw);
  background: #EED4D4;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  color: var(--forumbar-light-primary);
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  overflow: hidden;
  user-select: none;
  transition: height 0.3s ease; /* Smooth transition */
}

#forum-bar hr {
  margin: 0;
  position: relative;
  left: 16px;
  width: calc(100% - 32px);
  border: none;
  border-top: solid 1px var(--forumbar-dark-secondary);
}

#forum-bar a {
  color: inherit;
  text-decoration: inherit;
}
#forum-bar input[type=checkbox] {
  display: none;
}

#forum-header {
  position: relative;
  width: var(--forumbar-width);
  left: 16px;
  width: calc(var(--forumbar-width) - 16px);
  min-height: 80px;
  background: #EED4D4;
  border-radius: 16px;
  z-index: 2;
  display: flex;
  align-items: center;
  transition: width 0.2s;
}
#forum-header hr {
  position: absolute;
  bottom: 0;
}

#forum-title {
  font-size: 1.5rem;
  transition: opacity 1s;
}

label[for=forum-toggle] {
  position: absolute;
  right: 0;
  width: 3rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

</style>
