import type { Metadata } from 'next';
import Home from './Home';

export const metadata: Metadata = {
  title: "Home - Autoliv (Thailand) Co., Ltd.",
  description: "This is the layout for the application section.",
};

export default function HomePage() {
    return (
        <Home />
    )
}