<template>
<div id="forum-bar">
  <input id="forum-toggle" type="checkbox"/>
  <div id="forum-header"><a id="forum-title" href="https://codepen.io" target="_blank">headerrrrr</a>
    <label for="forum-toggle"><span id="forum-toggle-burger"></span></label>
    <hr/>
  </div>
  <div id="forum-content">
    <div class="forum-button">
      <i class="fas fa-palette"></i>
      <router-link to="/forum/createpost"><span>Create</span></router-link>
    </div>
    <div class="forum-button"><i class="fas fa-images"></i><span>trending</span></div>
    <div class="forum-button"><i class="fas fa-thumbtack"></i><span>recent</span></div>
    <hr/>
    <div class="forum-button"><i class="fas fa-heart"></i><span>hello4</span></div>
    <div class="forum-button"><i class="fas fa-chart-line"></i><span>hello5</span></div>
    <hr/>
    <div class="forum-button"><i class="fas fa-gem"></i><span>first textttt</span></div>
    <div id="forum-content-highlight"></div>
  </div>
  <input id="forum-footer-toggle" type="checkbox"/>
  <div id="forum-footer">
    <div id="forum-footer-heading">
      <div id="forum-footer-avatar"><img src="../assets/icons/profile.png"/></div>
      <div id="forum-footer-titlebox"><a id="forum-footer-title" href="https://codepen.io/uahnbu/pens/public" target="_blank">userrr</a><span id="forum-footer-subtitle">roleeee</span></div>
      <label for="forum-footer-toggle"><i class="fas fa-caret-up"></i></label>
    </div>
    <div id="forum-footer-content">
      <Lorem>ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Lorem>
    </div>
  </div>
</div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ForumSidebar',
  setup() {
    const isCollapsed = ref(false);
    const showSubscribed = ref(false);

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    const toggleSubscribed = () => {
      showSubscribed.value = !showSubscribed.value;
    };
    return {
      isCollapsed,
      showSubscribed,
      toggleSidebar,
      toggleSubscribed,
    };
  },
};
</script>



<style scoped>
.forum-sidebar {
  background-color: #f7cccc;
  transition: width 0.3s ease;
  height: 100vh;
  position: fixed;
  top: 75px; /* Adjust this value to match your forumbar height */
  left: 0;
  z-index: 999; /* Stays on top of other content */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* Adds a shadow for better visibility */ 
}

.forum-sidebar.collapsed {
  width: 15px; /* Smaller width when collapsed */
}

ul {
  flex-grow: 1;
}

.sidebar-link {
  display: flex;
  align-items: center;
  color: #242424;
  padding: 10px 0;
  text-decoration: none;
  font-size: 18px;
  transition: color 0.3s;
}

.sidebar-link i {
  margin-right: 15px;
}

.sidebar-link:hover {
  color: #ff9689;
}

ul.list-unstyled {
  padding-left: 0;
}

.dropdown-toggle {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 10px 0;
  cursor: pointer;
}

.collapse-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 30px;
  background-color: #f7cccc;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.collapse-btn:hover {
  background-color: #ff9689;
}

ul.list-unstyled .fa-caret-down {
  margin-left: auto;
}

.forum-sidebar.collapsed .fa-caret-down {
  display: none;
}

/* Hide all icons and text when the sidebar is collapsed */
.forum-sidebar.collapsed .sidebar-link span,
.forum-sidebar.collapsed .sidebar-link i {
  display: none;
}
</style>
