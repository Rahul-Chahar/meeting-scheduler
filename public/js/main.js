let selectedSlotId = null;

async function loadAllBookings() {
    try {
        const bookings = await fetchData('/api/bookings');
        const bookingsContainer = ensureContainer('bookings-container', 'Current Bookings');

        bookingsContainer.innerHTML = ''; // Clear existing bookings
        bookings.forEach(booking => {
            bookingsContainer.appendChild(createBookingElement(booking));
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

async function loadSlots() {
    try {
        const slots = await fetchData('/api/slots');
        const slotsContainer = ensureContainer('slots-container', 'Available Slots');

        slotsContainer.innerHTML = ''; // Clear existing slots
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid';
        slotsContainer.appendChild(gridContainer);

        slots.forEach(slot => {
            if (slot.available_slots > 0) {
                gridContainer.appendChild(createSlotElement(slot));
            }
        });
    } catch (error) {
        console.error('Error loading slots:', error);
    }
}

function ensureContainer(id, title) {
    let container = document.getElementById(id);
    if (!container) {
        container = document.createElement('div');
        container.id = id;
        container.innerHTML = `<h2 class="section-title">${title}</h2>`;
        document.querySelector('.container').appendChild(container);
    }
    return container;
}

function createBookingElement(booking) {
    const bookingElement = document.createElement('div');
    bookingElement.className = 'booking-details';
    bookingElement.innerHTML = `
        <p class="greeting">Hi ${booking.name},</p>
        <p class="meeting-info">Please join the meeting via this link:</p>
        <a href="https://meet.google.com/xxx-yyyy-zzz" class="meet-link" target="_blank">Google Meet Link</a>
        <p class="time-info">at ${formatTime(booking.time_slot)}</p>
        <button class="button button-danger" onclick="cancelBooking(${booking.id})">Cancel Meeting</button>
    `;
    return bookingElement;
}

function createSlotElement(slot) {
    const slotElement = document.createElement('div');
    slotElement.className = 'slot';
    slotElement.innerHTML = `
        <p class="time">${formatTime(slot.time_slot)}</p>
        <p class="slots-available">${slot.available_slots} slots available</p>
        <button class="button button-primary" onclick="selectSlot(${slot.id})">Select Slot</button>
    `;
    return slotElement;
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
}

function selectSlot(slotId) {
    selectedSlotId = slotId;
    document.getElementById('booking-form-overlay').style.display = 'block';
    clearForm();
}

function hideBookingForm() {
    document.getElementById('booking-form-overlay').style.display = 'none';
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
}

async function bookSlot() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if (!name || !email) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const result = await postData('/api/book', { slotId: selectedSlotId, name, email });
        alert(result.message);
        await refreshData();
    } catch (error) {
        console.error('Error booking slot:', error);
        alert('Booking failed');
    }
}

async function cancelBooking(bookingId) {
    try {
        const result = await postData('/api/cancel', { bookingId });
        alert(result.message);
        await refreshData();
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Cancellation failed');
    }
}

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data');
    return await response.json();
}

async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to post data');
    return await response.json();
}

async function refreshData() {
    await Promise.all([loadAllBookings(), loadSlots()]);
    hideBookingForm();
}

window.onload = refreshData;