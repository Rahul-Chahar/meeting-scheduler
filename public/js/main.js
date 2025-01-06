let selectedSlotId = null;

async function loadAllBookings() {
    try {
        const response = await fetch('/api/bookings');
        const bookings = await response.json();
        
        // Create bookings container if it doesn't exist
        let bookingsContainer = document.getElementById('bookings-container');
        if (!bookingsContainer) {
            bookingsContainer = document.createElement('div');
            bookingsContainer.id = 'bookings-container';
            document.body.insertBefore(bookingsContainer, document.getElementById('booking-form'));
        }
        
        // Clear existing bookings
        bookingsContainer.innerHTML = '<h2>Current Bookings</h2>';
        
        // Display all bookings
        if (Array.isArray(bookings) && bookings.length > 0) {
            bookings.forEach(booking => {
                showBookingDetails(booking);
            });
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function showBookingDetails(booking) {
    const bookingsContainer = document.getElementById('bookings-container');
    
    const bookingElement = document.createElement('div');
    bookingElement.className = 'booking-details';
    bookingElement.id = `booking-${booking.id}`;
    bookingElement.innerHTML = `
        <h3>Booking Details</h3>
        <p>Name: ${booking.name}</p>
        <p>Email: ${booking.email}</p>
        <p>Time: ${formatTime(booking.time_slot)}</p>
        <button onclick="cancelBooking(${booking.id})" class="cancel-btn">Cancel Booking</button>
    `;
    
    bookingsContainer.appendChild(bookingElement);
}

async function loadSlots() {
    try {
        const response = await fetch('/api/slots');
        const slots = await response.json();
        
        const container = document.getElementById('slots-container');
        container.innerHTML = '<h2>Available Slots</h2>';
        
        slots.forEach(slot => {
            if (slot.available_slots > 0) {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'slot';
                slotDiv.innerHTML = `
                    ${formatTime(slot.time_slot)}<br>
                    Available Slots: ${slot.available_slots}
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

function selectSlot(slotId) {
    selectedSlotId = slotId;
    const form = document.getElementById('booking-form');
    form.style.display = 'block';
    clearForm();
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
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
            body: JSON.stringify({ 
                slotId: selectedSlotId, 
                name, 
                email 
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Reload all data
            await loadAllBookings();
            await loadSlots();
            
            // Hide the booking form
            document.getElementById('booking-form').style.display = 'none';
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
            body: JSON.stringify({ bookingId })
        });

        const result = await response.json();

        if (response.ok) {
            // Reload all data
            await loadAllBookings();
            await loadSlots();
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
window.onload = async function() {
    await Promise.all([
        loadAllBookings(),
        loadSlots()
    ]);
}