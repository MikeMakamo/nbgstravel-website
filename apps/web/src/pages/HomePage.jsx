import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReviews, submitInquiry } from "../api.js";
import { fallbackReviews } from "../data/fallback.js";
import { categoryCards, faqs, homeServices, liveMedia } from "../siteContent.js";

export function HomePage() {
  const [reviews, setReviews] = useState(fallbackReviews);
  const [inquiry, setInquiry] = useState({ fullName: "", phoneNumber: "", email: "", message: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getReviews()
      .then((data) => setReviews(data.reviews))
      .catch(() => setReviews(fallbackReviews));
  }, []);

  async function handleInquiry(event) {
    event.preventDefault();
    try {
      await submitInquiry({
        inquiryType: "homepage",
        fullName: inquiry.fullName,
        phoneNumber: inquiry.phoneNumber,
        email: inquiry.email,
        message: inquiry.message,
        sourcePageUrl: window.location.href
      });
      setMessage("Your inquiry has been received. An NBGS Travel consultant will contact you shortly.");
      setInquiry({ fullName: "", phoneNumber: "", email: "", message: "" });
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <section className="hero-banner">
        <div className="hero-copy centered-hero-copy">
          <h1>Explore and see the world</h1>
          <p>make your life a little more colourful</p>
        </div>
        <div className="hero-image-strip">
          <img src={liveMedia.homeHero} alt="Explore and see the world" />
        </div>
      </section>

      <section className="intro-section">
        <div className="container intro-grid">
          <div className="intro-copy">
            <h2 className="intro-title-italic">Bespoke Traveling With NBGS TRAVEL</h2>
            <p>
              NBGS Travel is a South African travel agency that specializes in creating personalized vacations and
              activities to match your budget and preferences.
            </p>
            <div className="intro-cta-row">
              <a href="#home-inquiry" className="accent-button">
                Plan My Trip
              </a>
              <Link to="/packages" className="secondary-button">
                View Packages
              </Link>
            </div>
            <div className="home-category-links">
              {categoryCards.map((card) => (
                <Link key={card.title} to={card.href} className="trip-mini-card">
                  <span>{card.kicker}</span>
                  <strong>{card.title}</strong>
                  <small>{card.subtitle}</small>
                </Link>
              ))}
            </div>
          </div>
          <div className="intro-collage">
            <img src={liveMedia.introLeft} alt="Travel planning" className="collage-large" />
            <img src={liveMedia.introRight} alt="Travel experiences" className="collage-small" />
            <img src="/assets/images/profile picture 1.jpg" alt="NBGS trip moments" className="collage-small" />
          </div>
        </div>
      </section>

      <section className="service-section">
        <div className="container">
          <h2 className="section-title">Get to know our travel services</h2>
          <div className="service-grid">
            {homeServices.map((service) => (
              <article key={service.title} className="service-card">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
          <div className="service-link-row">
            <Link to="/visa" className="subtle-link">
              Visa Services
            </Link>
          </div>
        </div>
      </section>

      <section className="continents-section">
        <div className="container">
          <h2 className="section-title">Planning Your Journey Starts Here</h2>
          <div className="continents-grid">
            {liveMedia.continents.map((continent) => (
              <Link key={continent.title} to="/packages" className="continent-card">
                <img src={continent.image} alt={continent.title} />
                <div className="continent-overlay">
                  <strong>{continent.title}</strong>
                  <span>{continent.subtitle}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container narrow-section">
          <h2 className="section-title">Common Questions:</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0} className="faq-item">
                <summary>{faq.question}</summary>
                {faq.answer ? <p>{faq.answer}</p> : null}
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="container narrow-section">
          <h2 className="section-title">What our clients have to say</h2>
          <div className="review-list">
            {reviews.slice(0, 3).map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-stars">{"★".repeat(review.rating || 5)}</div>
                <p>{review.review_text}</p>
                <strong>{review.reviewer_name}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="previous-trips-section">
        <div className="container">
          <h2 className="section-title">Previous Trips</h2>
          <div className="previous-trips-grid">
            {liveMedia.previousTrips.map((image, index) => (
              <div key={image} className="trip-photo">
                <img src={image} alt={`NBGS previous trip ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-strip" id="home-inquiry">
        <div className="container inquiry-inline-layout">
          <div>
            <h2 className="section-title left-aligned">Start your travel inquiry</h2>
            <p>Share your preferred destination and dates and our agents will help shape the journey.</p>
          </div>
          <form className="mini-inquiry-form" onSubmit={handleInquiry}>
            <input placeholder="Name and surname" value={inquiry.fullName} onChange={(event) => setInquiry({ ...inquiry, fullName: event.target.value })} required />
            <input placeholder="Phone number" value={inquiry.phoneNumber} onChange={(event) => setInquiry({ ...inquiry, phoneNumber: event.target.value })} required />
            <input type="email" placeholder="Email" value={inquiry.email} onChange={(event) => setInquiry({ ...inquiry, email: event.target.value })} required />
            <textarea placeholder="Where would you like to go?" value={inquiry.message} onChange={(event) => setInquiry({ ...inquiry, message: event.target.value })} />
            <button type="submit" className="accent-button">
              Send Inquiry
            </button>
            {message ? <p className="form-message">{message}</p> : null}
          </form>
        </div>
      </section>
    </>
  );
}
