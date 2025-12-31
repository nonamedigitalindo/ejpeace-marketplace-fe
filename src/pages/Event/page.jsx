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

  // Hero image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Auto-Scroll Logic for Past Events
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

  // Helper function to get event images
  const getEventImages = (event) => {
    if (event?.images?.length > 0) return event.images;
    if (event?.image) return [event.image];
    return [];
  };

  // Get images for hero carousel (computed early for hooks)
  const heroImages = selectedEvent ? getEventImages(selectedEvent) : [];

  // Auto-rotate hero images
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Reset image index when selected event changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedEvent?.id]);

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

  // formatDate helper
  const formatDate = (date) => {
    if (!date) return "Date TBA";
    return new Date(date).toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // formatTime helper
  const formatTime = (date) => {
    if (!date) return "Time TBA";
    return new Date(date).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="min-h-screen bg-[#1a1a2e] text-gray-800 font-sans selection:bg-yellow-200 selection:text-black">

      {/* ================= HERO BANNER SECTION ================= */}
      {/* Desktop: Full overlay | Mobile: Image only */}
      <div className="relative w-full min-h-[50vh] md:min-h-[85vh] overflow-hidden bg-black">
        {/* Background Images with Carousel Effect */}
        {heroImages.map((image, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
          >
            {/* Blurred Background */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-60"
              style={{ backgroundImage: `url(${resolveImageSrc(image)})` }}
            />
            <div
              className="absolute inset-0 bg-center bg-no-repeat z-10 bg-cover"
              style={{ backgroundImage: `url(${resolveImageSrc(image)})` }}
            />
          </div>
        ))}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none z-10" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none z-10" />

        {/* Desktop Content Overlay (hidden on mobile) */}
        <div className="hidden md:flex absolute inset-0 items-end z-20">
          <div className="w-full p-8 lg:p-16 xl:p-20 pb-12 lg:pb-20">
            <div className="max-w-4xl">
              {/* Featured badge */}
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-6">
                <span className="text-lg">⭐</span> Featured Event
              </div>

              {/* Title */}
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.95] tracking-tight mb-4 uppercase">
                {selectedEvent.title}
              </h1>

              {/* Description */}
              <p className="text-gray-200 text-lg max-w-2xl mb-6 leading-relaxed">
                {selectedEvent.description || "Experience the unforgettable moments with us."}
              </p>

              {/* Info Badges */}
              <div className="flex flex-wrap items-center gap-4 mb-8 text-white/90 font-medium">
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-full text-sm">
                  <FaCalendarAlt className="text-yellow-400" />
                  <span>{formatDate(selectedEvent.start_date)}</span>
                </div>
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-full text-sm">
                  <FaClock className="text-yellow-400" />
                  <span>{formatTime(selectedEvent.start_date)} - {formatTime(selectedEvent.end_date)}</span>
                </div>
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-full text-sm">
                  <FaMapMarkerAlt className="text-yellow-400" />
                  <span>{selectedEvent.location || "Location TBA"}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleGetTicket(selectedEvent)}
                className="px-8 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full hover:bg-yellow-300 transition-all inline-flex items-center gap-3"
              >
                GET TICKET NOW <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Indicators (Desktop) */}
        {heroImages.length > 1 && (
          <div className="hidden md:flex absolute top-1/2 right-8 -translate-y-1/2 z-20 flex-col gap-2">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === currentImageIndex ? 'bg-yellow-400 scale-125' : 'bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= MOBILE CONTENT CARD (below hero) ================= */}
      <div className="md:hidden bg-[#0d0d1a] px-4 py-6 relative z-30">
        <div className="bg-transparent p-0">
          {/* Featured badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-4">
            <span className="text-lg">⭐</span> Featured Event
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-2 uppercase">
            {selectedEvent.title}
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-6">
            {selectedEvent.description || "Experience the unforgettable moments with us."}
          </p>

          {/* Info Badges - Stacked with dark bg and yellow border */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 bg-[#0d0d1a] border border-yellow-500/50 px-4 py-3 rounded-xl text-white">
              <FaCalendarAlt className="text-yellow-400" />
              <span>{formatDate(selectedEvent.start_date)}</span>
            </div>
            <div className="flex items-center gap-3 bg-[#0d0d1a] border border-yellow-500/50 px-4 py-3 rounded-xl text-white">
              <FaClock className="text-yellow-400" />
              <span>{formatTime(selectedEvent.start_date)} - {formatTime(selectedEvent.end_date)}</span>
            </div>
            <div className="flex items-center gap-3 bg-[#0d0d1a] border border-yellow-500/50 px-4 py-3 rounded-xl text-white">
              <FaMapMarkerAlt className="text-yellow-400" />
              <span>{selectedEvent.location || "Location TBA"}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => handleGetTicket(selectedEvent)}
            className="w-full py-4 bg-yellow-400 text-black font-bold text-base rounded-xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"
          >
            <FaTicketAlt /> GET TICKET NOW <FaArrowRight />
          </button>
        </div>
      </div>

      {/* ================= DETAIL EVENT SECTION (Image Gallery) ================= */}
      {heroImages.length > 0 && (
        <div className="bg-white py-12 sm:py-16 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">Detail Event</h2>

            {/* Image Gallery - 1 photo per row, banner-like aspect ratio */}
            <div className="flex flex-col gap-4">
              {heroImages.map((image, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <img
                    src={resolveImageSrc(image)}
                    alt={`Event photo ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaArrowRight className="text-black" />
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-full">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= PAST EVENTS SECTION ================= */}
      {concluded.length > 0 && (
        <div className="py-12 sm:py-24 bg-white border-t border-gray-100 relative group/section">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6">
            <div>
              <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs sm:text-sm">Highlights</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-black mt-1 sm:mt-2">Past Events</h2>
            </div>

            {/* Header Arrows (Desktop) */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => scrollPastEvents('left')}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
                aria-label="Scroll left"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => scrollPastEvents('right')}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
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
              className="absolute left-2 sm:hidden top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-black active:scale-95 transition-all"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollPastEvents('right');
              }}
              className="absolute right-2 sm:hidden top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-black active:scale-95 transition-all"
            >
              <FaChevronRight className="text-sm" />
            </button>

            <div
              ref={pastEventsRef}
              className="flex overflow-x-auto gap-3 sm:gap-6 md:gap-8 px-4 sm:px-8 lg:px-12 pb-6 sm:pb-12 snap-x hide-scrollbar scroll-smooth"
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
                    className="group relative flex-shrink-0 w-[70vw] sm:w-[350px] md:w-[400px] lg:w-[450px] aspect-[3/4] rounded-xl sm:rounded-[2rem] overflow-hidden snap-center transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border border-gray-100 bg-gray-100 cursor-pointer"
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
                    <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end text-left items-start z-10">
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs uppercase tracking-wider shadow-lg">
                        {formatDate(ev.start_date)}
                      </div>

                      <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight mb-2 sm:mb-4 group-hover:text-yellow-400 transition-colors drop-shadow-md line-clamp-2">
                        {ev.title}
                      </h3>

                      <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm mb-3 sm:mb-6 font-medium">
                        <FaMapMarkerAlt className="text-yellow-500 text-xs sm:text-sm" />
                        <span className="line-clamp-1 truncate max-w-[180px] sm:max-w-none">{ev.location || "Venue TBA"}</span>
                      </div>

                      {/* DIRECT ACTIONS */}
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetTicket(ev);
                          }}
                          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-lg"
                        >
                          <FaTicketAlt className="text-xs sm:text-sm" /> Get Ticket
                        </button>

                        <button className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur hover:bg-white/20 text-white rounded-lg sm:rounded-xl flex items-center justify-center border border-white/20 transition-colors">
                          <FaArrowRight className="text-xs sm:text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="w-8 sm:w-12 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      <div className="h-12 bg-white" />
    </div>
  );
}