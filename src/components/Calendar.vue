<template>
  <div id="calendar"></div>
  <!-- Modal for adding or viewing event details -->
  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <h3>{{ modalMode === 'add' ? 'Add Appointment' : 'Appointment Details' }}</h3>

      <div v-if="modalMode === 'add'">
        <!-- Input fields for adding a new event -->
        <label class="col-md-6 col-12">Add vaccine appointment:</label>
        <input type="text" v-model="newEvent.title" class="col-md-6 col-12 mb-1"/>

        <label class="col-md-6 col-12">Appointment Start Time:</label>
        <select v-model="newEvent.startTime" class="col-md-6 mb-1 col-12">
          <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
        </select>

        <label class="col-md-6 col-12">Appointment End Time:</label>
        <select v-model="newEvent.endTime" class="col-md-6 mb-1 col-12">
          <option v-for="time in filteredEndTimeOptions" :key="time" :value="time">{{ time }}</option>
        </select>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
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
import { collection, addDoc, getDocs, deleteDoc, doc, db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default {
  name: 'CalendarComponent',
  props: {
    childId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      calendar: null,
      showModal: false,
      modalMode: 'add',
      userId: null,
      newEvent: {
        title: '',
        date: '',
        startTime: '',
        endTime: ''
      },
      errorMessage: '',
      timeOptions: [
        '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
        '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
      ],
      singaporeHolidays : [
        { date: '2024-01-01', name: "New Year's Day" },
        { date: '2024-02-10', name: 'Chinese New Year' },
        { date: '2024-02-11', name: 'Chinese New Year (2nd Day)' },
        { date: '2024-03-29', name: 'Good Friday' },
        { date: '2024-04-10', name: 'Hari Raya Puasa' },
        { date: '2024-05-01', name: 'Labour Day' },
        { date: '2024-05-22', name: 'Vesak Day' },
        { date: '2024-06-17', name: 'Hari Raya Haji' },
        { date: '2024-08-09', name: 'National Day' },
        { date: '2024-10-31', name: 'Deepavali' },
        { date: '2024-12-25', name: 'Christmas Day' },

        { date: '2025-01-01', name: "New Year's Day" },
        { date: '2025-01-29', name: 'Chinese New Year' },
        { date: '2025-01-30', name: 'Chinese New Year (2nd Day)' },
        { date: '2025-03-31', name: 'Hari Raya Puasa' },
        { date: '2025-04-18', name: 'Good Friday' },
        { date: '2025-05-01', name: 'Labour Day' },
        { date: '2025-05-12', name: 'Vesak Day' },
        { date: '2025-06-07', name: 'Hari Raya Haji' },
        { date: '2025-08-09', name: 'National Day' },
        { date: '2025-10-20', name: 'Deepavali' },
        { date: '2025-12-25', name: 'Christmas Day' }
      ],
      selectedEvent: null,
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
        hour12: false
      }
    });
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        this.userId = currentUser.uid;
        this.calendar.render();
        this.fetchEvents();
      }});
  },
  watch: {
    childId: 'fetchEvents' // Refetch events whenever childId changes
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
      const formattedTime = info.event.start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false 
      });
      this.selectedEvent = {
        id: info.event.id,
        title: info.event.title,
        date: formattedDate,
        time: formattedTime,
        dismissed:false,
      };
      this.showModal = true;
    },
    closeModal() {
      this.newEvent = { title: '', date: '', time: '' };
      this.selectedEvent = null;
      this.showModal = false;
      this.errorMessage = '';
    },
    async saveEvent() {
      const { title, date, startTime, endTime } = this.newEvent;
      if (title && startTime && endTime && this.childId) {
        const event = {
          title,
          start: `${date}T${startTime}`,
          end: `${date}T${endTime}`,
          dismissed: false
        };

        const newCalendarEvent = this.calendar.addEvent(event);

        try {
          const userEventsRef = collection(db, "users", this.userId, "children", this.childId, "events");
          const docRef = await addDoc(userEventsRef, event);
          newCalendarEvent.setProp('id', docRef.id);
          await this.fetchEvents();
        } catch (error) {
          console.error("Error adding event to database:", error);
        }
        this.closeModal();
      } else {
        this.displayError("Please fill in all fields.");
      }
    },
    displayError(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    },
    async loadHolidays() {
      this.singaporeHolidays.forEach(holiday => {
        this.calendar.addEvent({
          title: holiday.name,
          start: holiday.date,
          color: "#FFD700",
          borderColor: "#FF7043",
          textColor: "#4A4A4A",
          display: "block",
        });
      });
    },
    async deleteEvent() {
      if (this.selectedEvent && this.childId) {
        try {
          const eventDocRef = doc(db, "users", this.userId, "children", this.childId, "events", this.selectedEvent.id);
          await deleteDoc(eventDocRef);
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
      if (!this.childId) return;
      try {
        const userEventsRef = collection(db, "users", this.userId, "children", this.childId, "events");
        const querySnapshot = await getDocs(userEventsRef);
        this.calendar.getEvents().forEach(event => event.remove());
        this.loadHolidays();
        querySnapshot.forEach(doc => {
          const eventData = doc.data();
          this.calendar.addEvent({
            id: doc.id,
            title: eventData.title,
            start: eventData.start,
            color: "#4A90E2",
            borderColor: "#357ABD",
            textColor: "#FFF",
            display: "block",
          });
        });
      } catch (error) {
        console.error("Error fetching events from database:", error);
      }
    }
  },
  computed: {
  // Returns all time options for the start time
    timeOptions() {
      return [
        '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
        '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
      ];
    },

  // Filters end time options based on the selected start time
    filteredEndTimeOptions() {
      const startTimeIndex = this.timeOptions.indexOf(this.newEvent.startTime);
      // If start time is selected, only show end times that are later than start time
      return startTimeIndex === -1
        ? this.timeOptions // No start time selected, return all times
        : this.timeOptions.slice(startTimeIndex + 1); // Only times after start time
    }
  },

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
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 300px;
  width: 90%;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
}

button {
  background-color: #A3C4BC;
  color: #FFFFFF;
  padding: 6px 12px; /* Smaller padding */
  font-size: 0.9rem; /* Smaller font size */
  margin: 3px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

button:hover {
   background-color: #7BAAA3;
}

.cancel-button {
   background-color: #F2A490; /* Soft orange for Cancel */
   color: white;
   margin-left: 10px;
}


#calendar {
  margin-top: 20px;
  
}
::v-deep .fc-daygrid-day-frame, .fc-col-header-cell {
   border: 1px solid #d6c9bf; /* Soft border for grid */
   background-color: #F4E8DE; /* Light, warm background for weekdays */
}
/* Border for each day cell */
::v-deep .fc-daygrid-day-frame {
   border: 1px solid #D6C9BF; /* Soft beige border */
   border-radius: 6px; /* Rounded corners */
   padding: 5px;
   transition: background-color 0.3s; /* Smooth transition for hover */
}

/* Hover effect for each day */
::v-deep .fc-daygrid-day-frame:hover {
   background-color: #F5EDE2; /* Light peach for hover effect */
   box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow on hover */
   cursor: pointer;
}

/* Target the day headers (Sunday, Monday, etc.) */
::v-deep .fc-col-header-cell {
   background-color: #F4E8DE; /* Light beige for headers */
   color: #F4E8DE; /* Darker text for readability */
   font-weight: bold;
   padding: 10px;
   border-bottom: 1px solid #d6c9bf; /* Optional border for separation */
}

/* Optional: Adjust text color on hover for a subtle effect */
::v-deep .fc-col-header-cell:hover {
   background-color: #E9DCCD; /* Slightly darker shade on hover */
   cursor: pointer;
}

::v-deep .fc-day-sat .fc-daygrid-day-frame, 
::v-deep .fc-day-sun .fc-daygrid-day-frame {
   background-color: #FFE9D6; /* Soft pastel peach for weekends */
}

::v-deep .fc-day-today .fc-daygrid-day-frame {
    background-color: #f0cadf; /* Bright yellow background */
    border: 2px solid #FFA500; /* Orange border for contrast */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Add a shadow for depth */
    color: #000; /* Dark text for readability */
    font-weight: bold; /* Bold font to make the text stand out */
}

/* Optional: Add hover effect specifically for today's date */
::v-deep .fc-day-today .fc-daygrid-day-frame:hover {
    background-color: #e49ac3; /* Slightly darker shade on hover */
}
input[type="text"],
select {
   width: 100%;
   padding: 8px;
   margin-bottom: 10px;
   border: 1px solid #d6c9bf;
   border-radius: 4px;
   background-color: #FFF9F5; /* Light beige input field */
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
  animation: fadeOut 2s ease forwards;
}
::v-deep .fc-event {
  border: 1px solid #357ABD !important; /* Defined border */
  border-radius: 4px; /* Rounded corners */
  padding: 3px 6px; /* Inner padding for better spacing */
  color: #FFF !important; /* White text for contrast */
  font-size: 0.9em;
  font-weight: 500;
  display: flex;
  align-items: start;
  justify-content: start;
  white-space: nowrap; /* Prevents text from wrapping */
  overflow: hidden; /* Ensures overflow is hidden */
  text-overflow: ellipsis; /* Adds an ellipsis (...) for overflowing text */
  max-width: 100%; /* Ensures the box width is constrained */
}


@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
@media screen and (min-width: 1400px) {
  .modal-content {
    max-width: 900px;
    font-size: 1.5rem;
  }
}

select{
  font-size: 1.1rem;
}
</style>
