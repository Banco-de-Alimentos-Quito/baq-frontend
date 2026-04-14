"use client";

const testimonials = [
  {
    name: "Jaime Muñoz",
    role: "Voluntariado BAQ",
    video: "/testimonials/jaime-munoz-voluntariado.mp4",
  },
  {
    name: "Mary Moncada",
    role: "Proyecto ACNUR",
    video: "/testimonials/mary-moncada-proyecto-acnur.mp4",
  },
  {
    name: "María Aguagallo",
    role: "Voluntaria Operativa BAQ",
    video: "/testimonials/maria-aguagallo-voluntaria.mp4",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">
            Historias que Inspiran
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Detrás de cada donación, hay una historia. Conoce el impacto real de
            tu generosidad.
          </p>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white animate-in fade-in-0 slide-in-from-bottom-10"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <video
                className="w-full aspect-video object-cover"
                controls
                preload="metadata"
                playsInline
              >
                <source src={testimonial.video} type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>
              <div className="p-4 text-center">
                <p className="font-semibold text-foreground text-lg">
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
