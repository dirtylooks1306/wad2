<template>
  <div id="calendar"></div>
  <!-- Modal for adding or viewing event details -->
  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <h3>{{ modalMode === 'add' ? 'Add Event' : 'Event Details' }}</h3>

      <div v-if="modalMode === 'add'">
        <!-- Input fields for adding a new event -->
        <label class="col-md-6 col-12">Event Title:</label>
        <input type="text" v-model="newEvent.title" class="col-md-6 col-12 mb-1"/>

        <label class="col-md-6 col-12">Event Start Time:</label>
        <select v-model="newEvent.endTime" class="col-md-6 mb-1 col-12">
          <option v-for="time in filteredEndTimeOptions" :key="time" :value="time">{{ time }}</option>
        </select>

        <label  class="col-md-6 col-12">Event End Time:</label>
        <select v-model="newEvent.endTime"  class="col-md-6 mb-1 ">
          <option v-for="time in filteredEndTimeOptions" :key="time" :value="time">{{ time }}</option>
        </select>
        
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
        startTime: '',
        endTime: ''
      },      
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
    async loadHolidays() {
    this.singaporeHolidays.forEach(holiday => {
      this.calendar.addEvent({
        title: holiday.name,
        start: holiday.date,
        color: holiday.color
      });
    });
  },
    async saveEvent() {
      const { title, date, startTime, endTime } = this.newEvent;
      if (title && startTime && endTime) {
        // Create event object with combined date and time
        const event = {
          title,
          start: `${date}T${startTime}`,
          end: `${date}T${endTime}`,
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
        this.loadHolidays();
        querySnapshot.forEach(doc => {
          const eventData = doc.data();
          this.calendar.addEvent({
            id: doc.id, // Use Firestore doc id as event id
            title: eventData.title,
            start: eventData.start,
            color: eventData.color,
            borderColor: eventData.borderColor
          });
        });
      } catch (error) {
        console.error("Error fetching events from database:", error);
      }
    }
  },
  computed: {
    filteredEndTimeOptions() {
      const startTimeIndex = this.timeOptions.indexOf(this.newEvent.startTime);
      // If a start time is selected, filter end times to be equal or later than start time
      return startTimeIndex === -1
        ? this.timeOptions
        : this.timeOptions.slice(startTimeIndex);
    }
  }
}
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

#calendar {
  margin-top: 20px;
  
}
::v-deep .fc-daygrid-day-frame, .fc-col-header-cell{
    border: 2px solid #353333;
  }
  ::v-deep .fc-event {
    border: 2px solid #e30f0f;
    border-radius: 4px;
  }
@media screen and (min-width: 1400px) {
  .modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 900px;
  width: 100%;
  font-size: 30px;
}
  
}
</style>
