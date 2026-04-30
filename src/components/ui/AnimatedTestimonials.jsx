import React, { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { Quote, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar"
import { Separator } from "./Separator"

export function AnimatedTestimonials({
  title = "Echoes of the Community",
  subtitle = "Discover the stories of delight from our pan-India network of gift seekers and artisans.",
  badgeText = "Trusted by 50,000+ Indians",
  testimonials = [
    {
      id: 1,
      name: "Rohan Malhotra",
      role: "Lead Architect",
      company: "Innovate Bangalore",
      content: "GiftKart transformed how I gift. The AI Vibe engine caught the exact 'old-world charm' I wanted for my parents' anniversary. The artisan hamper was a masterpiece.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=rohan"
    },
    {
      id: 2,
      name: "Ananya Sharma",
      role: "Creative Director",
      company: "Vogue Mumbai",
      content: "The level of personalization is insane. I've never seen a platform that lets you weave fairy lights and arrange truffles in a virtual studio. Truly world-class.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=ananya"
    },
    {
      id: 3,
      name: "Vikram Aditya",
      role: "Founder",
      company: "Heritage Delhi",
      content: "As someone who values traditional craftsmanship, GiftKart is a godsend. Supporting local artisans while getting premium AI-assisted designs is the future of gifting.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=vikram"
    }
  ],
  autoRotateInterval = 6000,
  className,
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const controls = useAnimation()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  useEffect(() => {
    if (isInView) controls.start("visible")
  }, [isInView, controls])

  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, autoRotateInterval)
    return () => clearInterval(interval)
  }, [autoRotateInterval, testimonials.length])

  return (
    <section ref={sectionRef} id="testimonials" className={`artisan-testimonials-section ${className || ""}`}>
      <div className="artisan-container">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="testimonials-grid"
        >
          {/* Left side: Heading */}
          <motion.div variants={itemVariants} className="testimonials-heading">
            <div className="heading-wrapper">
              {badgeText && (
                <div className="artisan-badge">
                  <Star size={12} className="star-icon" />
                  <span>{badgeText}</span>
                </div>
              )}

              <h2 className="section-main-title">
                {title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 !== 0 ? 'accent-text' : ''}>{word} </span>
                ))}
              </h2>

              <p className="section-sub-text">
                {subtitle}
              </p>

              <div className="nav-indicators">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`nav-dot ${activeIndex === index ? "active" : ""}`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right side: Animated Cards */}
          <motion.div variants={itemVariants} className="testimonials-visual">
            <div className="card-stack">
                {testimonials.map((testimonial, index) => (
                <motion.div
                    key={testimonial.id}
                    className="testimonial-card-wrapper"
                    initial={{ opacity: 0, scale: 0.9, x: 30 }}
                    animate={{
                        opacity: activeIndex === index ? 1 : 0,
                        x: activeIndex === index ? 0 : 30,
                        scale: activeIndex === index ? 1 : 0.9,
                        zIndex: activeIndex === index ? 10 : 0
                    }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="artisan-card">
                        <div className="card-inner">
                            <div className="rating-stars">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                                ))}
                            </div>

                            <div className="quote-body">
                                <Quote className="quote-icon" size={40} />
                                <p className="testimonial-content">"{testimonial.content}"</p>
                            </div>

                            <Separator className="card-sep" />

                            <div className="testimonial-author">
                                <Avatar className="author-avatar">
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="author-info">
                                    <h3 className="author-name">{testimonial.name}</h3>
                                    <p className="author-role">{testimonial.role} at <span className="author-company">{testimonial.company}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="card-glow"></div>
                    </div>
                </motion.div>
                ))}
            </div>
            
            <div className="decorative-blob"></div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .artisan-testimonials-section {
            padding: 10rem 0;
            background: #050505;
            position: relative;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
        }

        .artisan-container {
            max-width: 1300px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .testimonials-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6rem;
            align-items: center;
        }

        /* Heading Styles */
        .testimonials-heading {
            max-width: 550px;
        }

        .artisan-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(251, 191, 36, 0.1);
            border: 1px solid rgba(251, 191, 36, 0.2);
            color: #fbbf24;
            padding: 0.5rem 1.2rem;
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 2rem;
        }

        .section-main-title {
            font-size: 4rem;
            font-weight: 900;
            color: white;
            line-height: 1.1;
            letter-spacing: -0.04em;
            margin-bottom: 2rem;
        }

        .accent-text {
            color: transparent;
            -webkit-text-stroke: 1px rgba(255,255,255,0.3);
        }

        .section-sub-text {
            font-size: 1.2rem;
            color: #71717a;
            line-height: 1.6;
            margin-bottom: 3rem;
            max-width: 450px;
        }

        .nav-indicators {
            display: flex;
            gap: 0.75rem;
        }

        .nav-dot {
            height: 4px;
            background: #18181b;
            border: none;
            border-radius: 10px;
            width: 24px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-dot.active {
            width: 60px;
            background: white;
        }

        /* Visual & Card Styles */
        .testimonials-visual {
            position: relative;
            height: 500px;
        }

        .card-stack {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .testimonial-card-wrapper {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .artisan-card {
            width: 100%;
            max-width: 500px;
            background: #0f1014;
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 40px;
            padding: 3rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 50px 100px rgba(0,0,0,0.5);
        }

        .card-inner {
            position: relative;
            z-index: 2;
        }

        .rating-stars {
            display: flex;
            gap: 0.4rem;
            margin-bottom: 2rem;
        }

        .quote-body {
            position: relative;
            margin-bottom: 3rem;
        }

        .quote-icon {
            position: absolute;
            top: -1.5rem;
            left: -1.5rem;
            color: rgba(255,255,255,0.03);
            transform: rotate(180deg);
        }

        .testimonial-content {
            font-size: 1.4rem;
            font-weight: 600;
            color: #e4e4e7;
            line-height: 1.5;
            letter-spacing: -0.01em;
        }

        .card-sep {
            background: rgba(255,255,255,0.05);
            margin-bottom: 2rem;
        }

        .testimonial-author {
            display: flex;
            align-items: center;
            gap: 1.25rem;
        }

        .author-avatar {
            width: 56px;
            height: 56px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .author-name {
            font-size: 1.1rem;
            font-weight: 800;
            color: white;
            margin-bottom: 0.2rem;
        }

        .author-role {
            font-size: 0.8rem;
            color: #71717a;
            font-weight: 500;
        }

        .author-company {
            color: #fbbf24;
            opacity: 0.8;
        }

        .card-glow {
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle at top right, rgba(251, 191, 36, 0.05), transparent 70%);
            pointer-events: none;
        }

        .decorative-blob {
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(251, 191, 36, 0.03) 0%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1;
        }

        @media (max-width: 1024px) {
            .testimonials-grid {
                grid-template-columns: 1fr;
                gap: 4rem;
                text-align: center;
            }
            .testimonials-heading { margin: 0 auto; }
            .section-sub-text { margin: 0 auto 3rem; }
            .nav-indicators { justify-content: center; }
            .section-main-title { font-size: 3rem; }
            .artisan-card { padding: 2rem; }
        }
      `}</style>
    </section>
  )
}
