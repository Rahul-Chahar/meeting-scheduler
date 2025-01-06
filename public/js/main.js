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
        slots.forEach(slot => {
            if (slot.available_slots > 0) {
                slotsContainer.appendChild(createSlotElement(slot));
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
        container.innerHTML = `<h2>${title}</h2>`;
        document.body.appendChild(container);
    }
    return container;
}

function createBookingElement(booking) {
    const bookingElement = document.createElement('div');
    bookingElement.className = 'booking-details';
    bookingElement.innerHTML = `
        <p>Name: ${booking.name}</p>
        <p>Email: ${booking.email}</p>
        <p>Time: ${formatTime(booking.time_slot)}</p>
        <button onclick="cancelBooking(${booking.id})">Cancel</button>
    `;
    return bookingElement;
}

function createSlotElement(slot) {
    const slotElement = document.createElement('div');
    slotElement.className = 'slot';
    slotElement.innerHTML = `
        <p>${formatTime(slot.time_slot)}</p>
        <p>Available Slot: ${slot.available_slots}</p>
        <button onclick="selectSlot(${slot.id})">Select</button>
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
    document.getElementById('booking-form').style.display = 'block';
    clearForm();
}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
}

async function bookSlot() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if (!name || !email) {
        return alert('Please fill in all fields');
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
    document.getElementById('booking-form').style.display = 'none';
}

window.onload = refreshData;
