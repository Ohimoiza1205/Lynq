export const mockVideos = [
  {
    id: "68cf763dba1c4f08d2695c45",
    title: "Advanced Cardiac Surgery - Mitral Valve Repair",
    description: "Comprehensive surgical procedure demonstrating minimally invasive mitral valve repair techniques",
    status: "ready",
    duration: 450,
    metadata: {
      specialty: "Cardiothoracic Surgery",
      difficulty: "advanced",
      tags: ["cardiac", "surgery", "mitral valve"]
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "68cf763dba1c4f08d2695c51", 
    title: "Laparoscopic Appendectomy Procedure",
    description: "Step-by-step laparoscopic appendectomy with detailed surgical technique demonstration",
    status: "ready",
    duration: 350,
    metadata: {
      specialty: "General Surgery", 
      difficulty: "intermediate",
      tags: ["laparoscopic", "appendectomy"]
    },
    createdAt: new Date().toISOString()
  }
];
