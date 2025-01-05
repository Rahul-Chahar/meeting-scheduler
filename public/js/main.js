let selectedSlotId = null;
let bookings = [];

// Load bookings from localStorage
function loadStoredBookings() {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
        bookings = JSON.parse(storedBookings);
        bookings.forEach(booking => {
            showBookingDetails(booking);
        });
    }
}

async function loadSlots() {
    try {
        const response = await fetch('/api/slots');
        const slots = await response.json();
        
        const container = document.getElementById('slots-container');
        container.innerHTML = '';
        
        slots.forEach(slot => {
            // Only show slots that have available capacity
            if (slot.available_slots > 0) {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'slot';
                slotDiv.innerHTML = `
                    ${formatTime(slot.time_slot)}<br>
                    ${slot.available_slots} Available
                    <button onclick="selectSlot(${slot.id}, '${slot.time_slot}')">Select</button>
                `;
                container.appendChild(slotDiv);
            }
        });
    } catch (error) {
        console.error('Error loading slots:', error);
    }
}

function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
}

function selectSlot(slotId, time) {
    selectedSlotId = slotId;
    document.getElementById('booking-form').style.display = 'block';
    clearForm();
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
}

function showBookingDetails(booking) {
    // Create or get the bookings container
    let bookingsContainer = document.getElementById('bookings-container');
    if (!bookingsContainer) {
        bookingsContainer = document.createElement('div');
        bookingsContainer.id = 'bookings-container';
        document.body.insertBefore(bookingsContainer, document.getElementById('booking-form'));
    }

    // Create a new booking element
    const bookingElement = document.createElement('div');
    bookingElement.className = 'booking-details';
    bookingElement.style.display = 'block';
    bookingElement.id = `booking-${booking.id}`;
    bookingElement.innerHTML = `
        <h3>Booking Details</h3>
        <p>Hi ${booking.name}, Please join the meeting at ${formatTime(booking.time_slot)}</p>
        <button onclick="cancelBooking(${booking.id})">Cancel Booking</button>
    `;
    
    bookingsContainer.appendChild(bookingElement);
}

async function bookSlot() {
    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        if (!name || !email) {
            alert('Please fill in all fields');
            return;
        }

        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slotId: selectedSlotId, name, email })
        });

        const result = await response.json();

        if (response.ok) {
            const newBooking = {
                id: result.bookingId,
                name: name,
                email: email,
                time_slot: result.time,
                slot_id: selectedSlotId
            };
            
            bookings.push(newBooking);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            showBookingDetails(newBooking);
            document.getElementById('booking-form').style.display = 'none';
            loadSlots();  // Reload slots to update availability
            alert(result.message);
        } else {
            alert(result.message || 'Booking failed');
        }
    } catch (error) {
        console.error('Error booking slot:', error);
        alert('Error booking slot');
    }
}

async function cancelBooking(bookingId) {
    try {
        const response = await fetch('/api/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: bookingId })
        });

        const result = await response.json();

        if (response.ok) {
            // Remove booking from array and localStorage
            bookings = bookings.filter(booking => booking.id !== bookingId);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            // Remove booking element from DOM
            const bookingElement = document.getElementById(`booking-${bookingId}`);
            if (bookingElement) {
                bookingElement.remove();
            }
            
            loadSlots();
            alert(result.message);
        } else {
            alert(result.message || 'Cancellation failed');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Error cancelling booking');
    }
}

// Initialize the page
window.onload = function() {
    loadStoredBookings();  // Load existing bookings
    loadSlots();          // Load available slots
}