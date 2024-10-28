<template>
  <div id="calendar"></div>
  
  <!-- Modal for adding or viewing event details -->
  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <h3>{{ modalMode === 'add' ? 'Add Event' : 'Event Details' }}</h3>

      <div v-if="modalMode === 'add'">
        <!-- Input fields for adding a new event -->
        <label>Event Title:</label>
        <input type="text" v-model="newEvent.title" />
        
        <label>Event Time:</label>
        <input type="time" v-model="newEvent.time" />
        
        <button @click="saveEvent">Save Event</button>
        <button @click="closeModal">Cancel</button>
      </div>

      <div v-else>
        <!-- Display event details with an option to delete -->
        <p><strong>Title:</strong> {{ selectedEvent.title }}</p>
        <p><strong>Date:</strong> {{ selectedEvent.date }}</p>
        <p><strong>Time:</strong> {{ selectedEvent.time }}</p>

        <button @click="deleteEvent">Delete Event</button>
        <button @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>


<script>
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, getDocs, deleteDoc, doc, db } from "../firebaseConfig";

export default {
  name: 'CalendarComponent',
  data() {
    return {
      calendar: null,
      showModal: false,
      modalMode: 'add', // 'add' or 'view' mode for the modal
      newEvent: {
        title: '',
        date: '',
        time: ''
      },
      selectedEvent: null, // Stores selected event details
    };
  },
  mounted() {
    const calendarEl = document.getElementById('calendar');
    this.calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      dateClick: this.handleDateClick,
      eventClick: this.handleEventClick,
      eventTimeFormat: { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Set to 24-hour format
      }
    });
    this.calendar.render();
    this.fetchEvents(); // load  the existing events when the calendar is rendered
  },
  methods: {
    handleDateClick(info) {
      this.modalMode = 'add';
      this.newEvent.date = info.dateStr;
      this.showModal = true;
    },
    handleEventClick(info) {
      this.modalMode = 'view';
      const formattedDate = info.event.start.toLocaleDateString('en-US', {
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });

        // format the time
      const formattedTime = info.event.start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false 
      });
      this.selectedEvent = {
        id: info.event.id,
        title: info.event.title,
        date: formattedDate,
        time: formattedTime
      };
      this.showModal = true;
    },
    closeModal() {
      // Reset event data and close modal
      this.newEvent = { title: '', date: '', time: '' };
      this.selectedEvent = null;
      this.showModal = false;
    },
    async saveEvent() {
      const { title, date, time } = this.newEvent;
      if (title && time) {
        // Create event object with combined date and time
        const event = {
          title,
          start: `${date}T${time}` 
        };

        // Add the event to the calendar
        const newCalendarEvent = this.calendar.addEvent(event);

        // Save the event to Firebase
        try {
          const userEventsRef = collection(db, "users", "user2", "events");
          const docRef = await addDoc(userEventsRef, event);

          // Set the event's id in FullCalendar to match the Firebase doc id
          newCalendarEvent.setProp('id', docRef.id);

          await this.fetchEvents(); // Optionally reload events

        } catch (error) {
          console.error("Error adding event to database:", error);
        }

        this.closeModal();
      } else {
        alert("Please enter an event title and time.");
      }
    },
    async deleteEvent() {
      if (this.selectedEvent) {
        // Delete event from Firebase
        try {
          const eventDocRef = doc(db, "users", "user2", "events", this.selectedEvent.id);
          await deleteDoc(eventDocRef);

          // Remove the event from FullCalendar
          const calendarEvent = this.calendar.getEventById(this.selectedEvent.id);
          if (calendarEvent) {
            calendarEvent.remove();
          }
        } catch (error) {
          console.error("Error deleting event from database:", error);
        }

        this.closeModal();
      }
    },
    async fetchEvents() {
      try {
        const userEventsRef = collection(db, "users", "user2", "events");
        const querySnapshot = await getDocs(userEventsRef);
        
        this.calendar.getEvents().forEach(event => event.remove());

        querySnapshot.forEach(doc => {
          const eventData = doc.data();
          this.calendar.addEvent({
            id: doc.id, // Use Firestore doc id as event id
            title: eventData.title,
            start: eventData.start
          });
        });
      } catch (error) {
        console.error("Error fetching events from database:", error);
      }
    }
  }
};
</script>


<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 300px;
  width: 100%;
}

button {
  margin-top: 10px;
}
</style>
