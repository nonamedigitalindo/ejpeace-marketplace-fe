import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getEvents } from "../../api/event";
import resolveImageSrc from "../../utils/image";
import NoDataMessage from "../../components/NoDataMessage";
import ImageCarousel from "./ImageCarousel";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaTicketAlt, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function EventPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref for Past Events auto-scroll
  const pastEventsRef = useRef(null);
  const [isHoveringPastEvents, setIsHoveringPastEvents] = useState(false);

  // FETCH EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        let eventsData = [];

        if (Array.isArray(response)) eventsData = response;
        else if (Array.isArray(response?.data)) eventsData = response.data;
        else if (Array.isArray(response?.events)) eventsData = response.events;
        else if (Array.isArray(response?.results)) eventsData = response.results;
        else if (Array.isArray(response?.data?.data)) eventsData = response.data.data;
        else if (response && typeof response === "object") {
          const arr = Object.values(response).find((v) => Array.isArray(v));
          eventsData = arr || [];
        }

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

  // Auto-Scroll Logic
  useEffect(() => {
    const container = pastEventsRef.current;
    // STOP auto-scroll if hovering (includes hovering the buttons now)
    if (!container || isHoveringPastEvents) return;

    let step = 0.5;
    const delay = 20;

    const scrollInterval = setInterval(() => {
      if (container) {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
          // Optional loop logic here if needed
        } else {
          container.scrollLeft += step;
        }
      }
    }, delay);

    return () => clearInterval(scrollInterval);
  }, [events, isHoveringPastEvents]);

  // Manual Scroll Handler
  const scrollPastEvents = (direction) => {
    const container = pastEventsRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const concluded = events.length > 1 ? [...events].slice(1) : [];

  const handleGetTicket = (event) => {
    // Navigate to store and search for the event title
    navigate("/ejpeace/store", {
      state: {
        searchFromEvent: event.title // Search by event name
      },
    });
  };

  const formatDate = (date) => {
    if (!date) return "Date TBA";
    return new Date(date).toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "Time TBA";
    return new Date(date).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventImages = (event) => {
    if (event?.images?.length > 0) return event.images;
    if (event?.image) return [event.image];
    return [];
  };

  if (loading)
    return (
      <div className="pt-28 min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="pt-28 min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500 bg-red-50 px-6 py-4 rounded-xl border border-red-100">
          {error}
        </div>
      </div>
    );

  if (!selectedEvent)
    return (
      <div className="pt-28 min-h-screen bg-white">
        <NoDataMessage
          title="No Events Available"
          message="Please check back later."
          actionText="Go to Home"
          onAction={() => navigate("/ejpeace/home")}
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-yellow-200 selection:text-black">

      {/* ================= HERO SECTION ================= */}
      <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full opacity-90">
          <ImageCarousel
            images={getEventImages(selectedEvent)}
            title={selectedEvent.title}
            interval={4000}
            className="w-full h-full rounded-none"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-full h-full flex flex-col justify-end p-6 sm:p-12 lg:p-20 z-10">
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(250,204,21,0.5)]">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
              Featured Event
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-8 drop-shadow-2xl uppercase">
              {selectedEvent.title}
            </h1>
            <p className="text-gray-200 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed font-light border-l-4 border-yellow-400 pl-6 drop-shadow-md">
              {selectedEvent.description || "Experience the unforgettable moments with us."}
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-8 mb-10 text-white/90 font-medium">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full">
                <FaCalendarAlt className="text-yellow-400" />
                <span>{formatDate(selectedEvent.start_date)}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full">
                <FaClock className="text-yellow-400" />
                <span>
                  {formatTime(selectedEvent.start_date)}
                  {selectedEvent.end_date && ` - ${formatTime(selectedEvent.end_date)}`}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full">
                <FaMapMarkerAlt className="text-yellow-400" />
                <span>{selectedEvent.location || "Location TBA"}</span>
              </div>
            </div>
            <button
              onClick={() => handleGetTicket(selectedEvent)}
              className="group relative px-10 py-5 bg-yellow-400 text-black font-extrabold text-lg sm:text-xl rounded-full overflow-hidden shadow-[0_0_40px_rgba(250,204,21,0.4)] hover:shadow-[0_0_60px_rgba(250,204,21,0.6)] hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 origin-left" />
              <span className="relative flex items-center justify-center gap-3">
                GET TICKET NOW
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>


      {/* ================= PAST EVENTS SECTION ================= */}
      {concluded.length > 0 && (
        <div className="py-24 bg-white border-t border-gray-100 relative group/section">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col sm:flex-row items-end justify-between gap-6">
            <div>
              <span className="text-yellow-500 font-bold uppercase tracking-widest text-sm">Highlights</span>
              <h2 className="text-4xl md:text-5xl font-black text-black mt-2">Past Events</h2>
            </div>

            {/* Header Arrows (Desktop) */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => scrollPastEvents('left')}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
                aria-label="Scroll left"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => scrollPastEvents('right')}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
                aria-label="Scroll right"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Container & Mobile Buttons */}
          <div
            className="relative"
            onMouseEnter={() => setIsHoveringPastEvents(true)}
            onMouseLeave={() => setIsHoveringPastEvents(false)}
          >
            {/* Mobile/Floating Arrows (Inside hover area now) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollPastEvents('left');
              }}
              className="absolute left-2 sm:hidden top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-black active:scale-95 transition-all opacity-80 hover:opacity-100"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollPastEvents('right');
              }}
              className="absolute right-2 sm:hidden top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-black active:scale-95 transition-all opacity-80 hover:opacity-100"
            >
              <FaChevronRight />
            </button>

            <div
              ref={pastEventsRef}
              className="flex overflow-x-auto gap-4 sm:gap-8 px-4 sm:px-8 lg:px-12 pb-12 snap-x hide-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {concluded.map((ev) => {
                const evImages = getEventImages(ev);
                const eventImage = evImages.length > 0 ? resolveImageSrc(evImages[0]) : null;

                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedEvent(ev);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group relative flex-shrink-0 w-[80vw] sm:w-[400px] md:w-[450px] aspect-[3/4] rounded-[2rem] overflow-hidden snap-center transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border border-gray-100 bg-gray-100 cursor-pointer"
                  >
                    {/* Background Image */}
                    {eventImage ? (
                      <img
                        src={eventImage}
                        alt={ev.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                        NO IMAGE
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300" />

                    {/* Hover Overlay Light */}
                    <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 transition-colors duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-left items-start z-10">
                      <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-lg">
                        {formatDate(ev.start_date)}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4 group-hover:text-yellow-400 transition-colors drop-shadow-md">
                        {ev.title}
                      </h3>

                      <div className="flex items-center gap-2 text-gray-300 text-sm mb-6 font-medium">
                        <FaMapMarkerAlt className="text-yellow-500" />
                        <span className="line-clamp-1">{ev.location || "Venue TBA"}</span>
                      </div>

                      {/* DIRECT ACTIONS */}
                      <div className="flex items-center gap-3 w-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetTicket(ev);
                          }}
                          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
                        >
                          <FaTicketAlt /> Get Ticket
                        </button>

                        <button className="w-12 h-12 bg-white/10 backdrop-blur hover:bg-white/20 text-white rounded-xl flex items-center justify-center border border-white/20 transition-colors">
                          <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="w-12 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      <div className="h-12 bg-white" />
    </div>
  );
}