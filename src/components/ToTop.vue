<template>
    <div id="to-top" @click="toTop">Back to Top</div>
  </template>
  
  <script>
  import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
  
  export default defineComponent({
    name: 'ToTop',
    setup() {
      const handleScroll = () => {
        const toTopButton = document.getElementById('to-top');
        if (toTopButton) {
          if (window.scrollY > 100) {
            toTopButton.style.display = 'block';
          } else {
            toTopButton.style.display = 'none';
          }
        }
      };
  
      const toTop = () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      };
  
      onMounted(() => {
        window.addEventListener('scroll', handleScroll);
      });
  
      onBeforeUnmount(() => {
        window.removeEventListener('scroll', handleScroll);
      });
  
      return {
        toTop
      };
    },
  });
  </script>
  
  <style scoped>
  #to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    display: none;
    z-index: 1000;
  }
  </style>
  