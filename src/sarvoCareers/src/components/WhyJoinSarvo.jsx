import React from 'react';
import { Clock, Home, HeartPulse, BookOpen, Sparkles, TrendingUp } from 'lucide-react';

const WhyJoinSarvo = () => {
  const perks = [
    {
      icon: <Clock size={20} />,
      title: "Flexible Hours",
      description: "Work when you are most productive. We believe in work-life integration over rigid timelines."
    },
    {
      icon: <Home size={20} />,
      title: "Remote & Hybrid Work",
      description: "Work from anywhere or collaborate from our modern hub in Pune. You decide where you work best."
    },
    {
      icon: <HeartPulse size={20} />,
      title: "Health & Wellness",
      description: "Comprehensive medical cover, wellness allowance, and regular mental health programs for everyone."
    },
    {
      icon: <BookOpen size={20} />,
      title: "Annual Learning Budget",
      description: "Get ₹50,000 yearly to spend on books, courses, certifications, or conferences of your choice."
    },
    {
      icon: <Sparkles size={20} />,
      title: "Modern Workstation Setup",
      description: "Get premium hardware, monitors, and ergonomic accessories to set up your dream desk."
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Fast-Track Career Growth",
      description: "Work on cutting-edge systems and scale up with defined mentorship and biannual review cycles."
    }
  ];

  return (
    <section className="why-sarvo">
      <div className="careers-container">
        <div className="why-sarvo-header">
          <h2>Why Join Sarvo?</h2>
          <p>We work on challenging problems, invest heavily in our team, and maintain an inclusive, feedback-first work culture.</p>
        </div>

        <div className="perks-grid">
          {perks.map((perk, i) => (
            <div key={i} className="perk-card">
              <div className="perk-icon-wrapper">
                {perk.icon}
              </div>
              <h3>{perk.title}</h3>
              <p>{perk.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyJoinSarvo;
