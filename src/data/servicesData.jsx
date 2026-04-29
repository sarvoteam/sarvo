import React from 'react';
import { 
  Code, 
  Smartphone, 
  Briefcase, 
  Layout, 
  Zap, 
  Rocket 
} from 'lucide-react';

export const servicesData = [
  {
    id: "web-engineering",
    icon: <Code size={32} />,
    title: "Web Engineering",
    desc: "Building scalable, high-performance web applications using modern frameworks like React and Next.js, optimized for speed and SEO.",
    longDesc: "Our web engineering team focuses on building robust, scalable, and high-performance applications. We leverage the latest technologies to ensure your digital presence is not only beautiful but also technically superior.",
    features: [
      "Custom React & Next.js Development",
      "Progressive Web Apps (PWA)",
      "API Integration & Backend Development",
      "Performance Optimization & SEO"
    ],
    color: "#6366f1",
    image: "/assets/services/web-engineering.png"
  },
  {
    id: "mobile-innovation",
    icon: <Smartphone size={32} />,
    title: "Mobile Innovation",
    desc: "Crafting premium, native-feel mobile experiences for iOS and Android platforms that keep users engaged and delighted.",
    longDesc: "We create seamless mobile experiences that feel native on every device. Our approach combines cutting-edge cross-platform tools with a deep understanding of mobile user behavior.",
    features: [
      "iOS & Android Development",
      "React Native Expertise",
      "Mobile-First UI/UX Design",
      "App Store Optimization"
    ],
    color: "#0ea5e9",
    image: "/assets/services/mobile-innovation.png"
  },
  {
    id: "enterprise-solutions",
    icon: <Briefcase size={32} />,
    title: "Enterprise Solutions",
    desc: "Robust software architectures and custom business tools designed to streamline complex operations and drive efficiency.",
    longDesc: "For large-scale operations, we provide enterprise-grade solutions that focus on security, scalability, and efficiency. We help businesses automate workflows and manage complex data.",
    features: [
      "Custom ERP & CRM Systems",
      "Cloud Infrastructure Setup",
      "Data Analytics & Visualization",
      "Security & Compliance Audits"
    ],
    color: "#8b5cf6",
    image: "/assets/services/enterprise-solutions.png"
  },
  {
    id: "ui-ux-excellence",
    icon: <Layout size={32} />,
    title: "UI/UX Excellence",
    desc: "Human-centric designs that prioritize usability and visual impact, ensuring a seamless digital journey across all devices.",
    longDesc: "Design is more than just aesthetics; it's about solving problems. Our design team focuses on creating intuitive interfaces that provide exceptional user experiences.",
    features: [
      "User Research & Personas",
      "Wireframing & Prototyping",
      "Visual Design Systems",
      "Interaction Design"
    ],
    color: "#ec4899",
    image: "/assets/services/ui-ux-excellence.png"
  },
  {
    id: "digital-transformation",
    icon: <Zap size={32} />,
    title: "Digital Transformation",
    desc: "Strategic technology integration to modernize your business processes, helping you stay ahead in an ever-evolving market.",
    longDesc: "We help traditional businesses transition into the digital age. Our transformation strategies are designed to increase agility and unlock new growth opportunities.",
    features: [
      "Digital Strategy Consulting",
      "Legacy System Modernization",
      "Agile Process Implementation",
      "Technology Stack Audit"
    ],
    color: "#f59e0b",
    image: "/assets/services/digital-transformation.png"
  },
  {
    id: "product-rd",
    icon: <Rocket size={32} />,
    title: "Product R&D",
    desc: "Innovation is our core. We develop and launch proprietary tech products, bringing startup agility to every project we touch.",
    longDesc: "We don't just build for others; we innovate for ourselves. Our R&D department is constantly experimenting with new technologies to create the next generation of digital products.",
    features: [
      "MVP Development",
      "Rapid Prototyping",
      "Market Feasibility Studies",
      "Scalability Planning"
    ],
    color: "#10b981",
    image: "/assets/services/product-rd.png"
  }
];
