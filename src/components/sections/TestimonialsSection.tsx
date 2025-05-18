import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Gracias al Banco de Alimentos, mis hijos pueden tener una comida nutritiva todos los días. Su ayuda ha sido una bendición.",
    name: "María P.",
    attribution: "Madre de familia beneficiada",
    image: "https://picsum.photos/100",
    aiHint: "happy mother",
  },
  {
    quote: "Ser voluntario aquí me ha enseñado el valor de la solidaridad. Ver el impacto directo de nuestro trabajo es muy gratificante.",
    name: "Carlos V.",
    attribution: "Voluntario",
    image: "https://picsum.photos/101",
    aiHint: "male volunteer",
  },
  {
    quote: "Como empresa, nos enorgullece colaborar con Alimento Para Todos. Es una forma tangible de contribuir a nuestra comunidad.",
    name: "Ana L. - Gerente de RSE",
    attribution: "Empresa colaboradora",
    image: "https://picsum.photos/102",
    aiHint: "business woman",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">Historias que Inspiran</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Detrás de cada donación, hay una historia. Conoce el impacto real de tu generosidad.
          </p>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name} 
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in-0 slide-in-from-bottom-10"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={80}
                  height={80}
                  className="rounded-full mb-4 border-2 border-primary"
                  data-ai-hint={testimonial.aiHint}
                />
                <Quote className="w-8 h-8 text-primary/50 mb-2" />
                <p className="text-muted-foreground italic mb-4">&quot;{testimonial.quote}&quot;</p>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.attribution}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
