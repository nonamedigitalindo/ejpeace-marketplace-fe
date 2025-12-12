import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getEvents } from "../../api/event";
import resolveImageSrc from "../../utils/image";
import NoDataMessage from "../../components/NoDataMessage";

export default function EventPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();

        // Support different response shapes the backend may return
        // Common shapes: [] | { data: [...] } | { events: [...] } | { results: [...] }
        let eventsData = [];

        if (Array.isArray(response)) eventsData = response;
        else if (Array.isArray(response?.data)) eventsData = response.data;
        else if (Array.isArray(response?.events)) eventsData = response.events;
        else if (Array.isArray(response?.results))
          eventsData = response.results;
        else if (Array.isArray(response?.data?.data))
          eventsData = response.data.data;
        else if (response && typeof response === "object") {
          // fallback: find the first array in object values
          const arr = Object.values(response).find((v) => Array.isArray(v));
          eventsData = arr || [];
        }

        // ensure array
        eventsData = Array.isArray(eventsData) ? eventsData : [];

        setEvents(eventsData);

        if (eventsData.length > 0) setSelectedEvent(eventsData[0]);
      } catch (err) {
        console.error("Failed to load events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const concluded = events.length > 1 ? [...events].slice(1) : [];

  const handleGetTicket = (event) => {
    navigate("/ejpeace/store", {
      state: {
        searchFromEvent: event.title,
      },
    });
  };

  const handleViewVouchers = () => navigate("/ejpeace/event/vouchers");

  // Format date with proper timezone (Indonesia/Jakarta)
  const formatDate = (date) => {
    if (!date) return "Date TBA";
    
    return new Date(date).toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time with proper timezone (Indonesia/Jakarta)
  const formatTime = (date) => {
    if (!date) return "Time TBA";
    
    return new Date(date).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format full datetime for display
  const formatDateTime = (startDate, endDate) => {
    if (!startDate) return "Schedule TBA";
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    const dateStr = start.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const startTimeStr = start.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
    
    if (!end) return `${dateStr}, ${startTimeStr}`;
    
    const endTimeStr = end.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
    
    return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
  };

  if (loading)
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center text-lg">
        Loading events...
      </div>
    );

  if (error)
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center text-red-500 text-lg">
        {error}
      </div>
    );

  if (!selectedEvent)
    return (
      <div className="pt-28 min-h-screen">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <NoDataMessage
            title="No Events Available"
            message="Please check back later."
            actionText="Go to Home"
            onAction={() => navigate("/ejpeace/home")}
          />
        </div>
      </div>
    );

  return (
    <div className="pt-28 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pb-12">
        {/* NEW EVENT TITLE */}
        <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide underline underline-offset-8 text-center sm:text-left">
          New Event
        </h1>

        {/* CURRENT EVENT CARD */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* TITLE */}
          <div className="text-center text-xl sm:text-2xl font-bold uppercase py-4 px-4 bg-gradient-to-r from-white-600 to-white-800 text-black">
            {selectedEvent.title}
          </div>

          {/* IMAGE BANNER */}
          {selectedEvent.image ? (
            <img
              src={resolveImageSrc(selectedEvent.image)}
              alt={selectedEvent.title}
              className="w-full h-[240px] sm:h-[300px] md:h-[400px] object-cover"
            />
          ) : (
            <div className="w-full h-[240px] sm:h-[300px] md:h-[400px] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Event Image</span>
            </div>
          )}

          {/* DESCRIPTION */}
          <div className="px-5 sm:px-8 mt-6 mb-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 uppercase">
              {selectedEvent.title}
            </h2>

            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {selectedEvent.description || "Join us for an amazing event experience!"}
            </p>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-t border-gray-300">
            {/* Location */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200 text-center sm:text-left hover:bg-gray-50 transition">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-sm uppercase">Location</h3>
              </div>
              <p className="text-sm text-gray-700">{selectedEvent.location || "Venue TBA"}</p>
            </div>

            {/* Date */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200 text-center sm:text-left hover:bg-gray-50 transition">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-sm uppercase">Date</h3>
              </div>
              <p className="text-sm text-gray-700">
                {formatDate(selectedEvent.start_date)}
              </p>
            </div>

            {/* Time */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200 text-center sm:text-left hover:bg-gray-50 transition">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-sm uppercase">Time</h3>
              </div>
              <p className="text-sm text-gray-700">
                {formatTime(selectedEvent.start_date)}
                {selectedEvent.end_date && (
                  <span> - {formatTime(selectedEvent.end_date)}</span>
                )}
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col items-center justify-center p-5 gap-3 bg-gray-50">
              <button
                onClick={() => handleGetTicket(selectedEvent)}
                className="bg-black-600 text-black font-extrabold px-6 py-3 rounded-lg w-full md:w-auto hover:bg-black-700 transition font-semibold shadow-md hover:shadow-lg"
              >
                Get Ticket
              </button>
            </div>
          </div>

          {/* Full Schedule Info (Optional - shows complete datetime range) */}
          {selectedEvent.start_date && selectedEvent.end_date && (
            <div className="px-5 py-4 bg-white-50 border-t border-white-200">
              <p className="text-sm text-center text-gray-700">
                <span className="font-semibold">Full Schedule:</span>{" "}
                {formatDateTime(selectedEvent.start_date, selectedEvent.end_date)}
              </p>
            </div>
          )}
        </div>

        {/* EVENT CONCLUDED */}
        {concluded.length > 0 && (
          <>
            <h2 className="text-xl font-bold mt-12 mb-6 uppercase tracking-wide underline underline-offset-8">
              Event Concluded
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
              {concluded.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all transform hover:-translate-y-1 text-left overflow-hidden"
                >
                  {ev.image ? (
                    <img
                      src={resolveImageSrc(ev.image)}
                      alt={ev.title}
                      className="w-full h-36 sm:h-40 md:h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 sm:h-40 md:h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}

                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-base leading-snug mb-2">
                      {ev.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{formatDate(ev.start_date)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}