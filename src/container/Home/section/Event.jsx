import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../../../api/event";
import resolveImageSrc from "../../../utils/image";

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        const eventsData = response?.data || response;

        if (!Array.isArray(eventsData)) {
          setError("Invalid data format from server");
          setLoading(false);
          return;
        }

        // Gunakan timestamp UTC agar filter lebih akurat
        const now = Date.now();
        const upcomingEvents = eventsData.filter((event) => {
          if (!event.start_date) return false;
          const eventTime = new Date(event.start_date).getTime();
          return !isNaN(eventTime) && eventTime >= now;
        });

        // Sort by start date, ambil 4 pertama
        const sortedEvents = upcomingEvents
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          .slice(0, 4);

        // Jika tidak ada upcoming, tampilkan semua event
        setEvents(
          sortedEvents.length > 0 ? sortedEvents : eventsData.slice(0, 4)
        );
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSeeMore = () => navigate("/ejpeace/event");
  const handleEventClick = (event) =>
    navigate("/ejpeace/event", { state: { eventId: event.id } });

  if (loading) {
    return (
      <section className="py-10 max-w-7xl mx-auto px-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">EVENT</h2>
          <button
            onClick={handleSeeMore}
            className="text-sm font-semibold border-2 rounded-full tracking-wide px-4 py-1 cursor-pointer hover:bg-black hover:text-white transition"
          >
            SEE MORE
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow animate-pulse"
            >
              <div className="w-full h-64 bg-gray-300" />
              <div className="p-3">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 max-w-7xl mx-auto px-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">EVENT</h2>
          <button
            onClick={handleSeeMore}
            className="text-sm font-semibold border-2 rounded-full tracking-wide px-4 py-1 cursor-pointer hover:bg-black hover:text-white transition"
          >
            SEE MORE
          </button>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </section>
    );
  }

  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">EVENTS</h2>
        <button
          onClick={handleSeeMore}
          className="text-sm font-semibold border-2 rounded-full tracking-wide px-4 py-1 cursor-pointer hover:bg-black hover:text-white transition"
        >
          SEE MORE
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {events.map((ev) => (
          <div
            key={ev.id}
            onClick={() => handleEventClick(ev)}
            className="bg-white rounded-xl overflow-hidden shadow hover:scale-95 transition duration-200 cursor-pointer"
          >
            {ev.images && ev.images.length > 0 ? (
              <img
                src={resolveImageSrc(ev.images[0])}
                alt={ev.title}
                className="w-full h-64 object-cover"
              />
            ) : ev.image ? (
              <img
                src={resolveImageSrc(ev.image)}
                alt={ev.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Event Image</span>
              </div>
            )}

            <div className="p-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faFire} className="text-orange-500" />
              <span className="font-medium">Hot Event</span>
            </div>

            <h3 className="font-semibold px-3 pb-3">{ev.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
