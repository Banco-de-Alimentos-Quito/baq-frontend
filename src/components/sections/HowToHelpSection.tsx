import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@//components/ui/button';
import { Apple, HandCoins, Users, Factory } from 'lucide-react';
import ScrollLink from '@/components/ScrollLink';

const helpOptions = [
  {
    icon: Apple,
    title: "Donar Alimentos",
    description: "Aporta alimentos no perecibles o frescos para ayudar a nutrir a familias necesitadas.",
    buttonText: "Ver Centros de Acopio",
    aiHint: "food donation",
  },
  {
    icon: HandCoins,
    title: "Donar Dinero",
    description: "Tu contribución económica nos permite adquirir alimentos específicos y cubrir costos operativos.",
    buttonText: "Donar Dinero",
    aiHint: "money charity",
  },
  {
    icon: Users,
    title: "Ser Voluntario",
    description: "Únete a nuestro equipo de voluntarios y ayúdanos con tu tiempo y talento en diversas tareas.",
    buttonText: "Conoce Más",
    aiHint: "volunteers helping",
  },
  {
    icon: Factory,
    title: "Empresas Colaboradoras",
    description: "Si representas a una empresa y deseas colaborar, contáctanos para explorar oportunidades de ayuda y de beneficios especiales para tu empresa.",
    buttonText: "Contáctanos",
    aiHint: "company collaboration",
  },
];

export default function HowToHelpSection() {
  return (
    <section id="how-to-help" className="bg-slate-50 dark:bg-slate-900 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">¿Cómo Puedes Ayudar?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Hay muchas formas de marcar la diferencia. Elige la que mejor se adapte a ti y ayúdanos a seguir alimentando esperanzas.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {helpOptions.map((option, index) => (
            <Card 
              key={option.title} 
              className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in-0 slide-in-from-bottom-10"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                  <option.icon className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow text-center">
                <CardDescription className="text-base">{option.description}</CardDescription>
              </CardContent>
              <CardFooter className="justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                  <ScrollLink href="#donate">{option.buttonText}</ScrollLink>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
