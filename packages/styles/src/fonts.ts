import { Exo_2, Orbitron, Space_Mono } from 'next/font/google';

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontClasses = [
  exo2.className,
  exo2.variable,
  orbitron.variable,
  spaceMono.variable,
].join(' ');
