import {
  type LucideIcon,
  MousePointer,
  UploadIcon,
  Share2Icon,
  GithubIcon,
  BookOpenText,
} from "lucide-react";
import {
  BatteryChargingIcon,
  KeyboardIcon,
  LayoutIcon,
  PersonStandingIcon,
  RocketIcon,
  SearchIcon,
  TimerIcon,
} from "lucide-react";

import Link from "next/link";
import type { ReactNode } from "react";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { RippleButton } from "@/components/magicui/ripple-button";
import { WordRotate } from "@/components/magicui/word-rotate";

const images = [
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./dash_wt_kqtzxi.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./login_xtlnif.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./poase_wt_plhgwc.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./profile_wt_fnj3rz.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./settigngs_open_hjkomr.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./Screenshot_j0csjm.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./dash_cndhwr.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./profile_mizwvg.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./profile_wt_fnj3rz.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./poase_wt_plhgwc.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./dash_wt_kqtzxi.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./dash_cndhwr.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./login_xtlnif.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./poase_wt_plhgwc.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./settigngs_open_hjkomr.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./Screenshot_j0csjm.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./dash_cndhwr.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./login_xtlnif.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./profile_mizwvg.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./dash_wt_kqtzxi.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./profile_wt_fnj3rz.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./profile_mizwvg.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./dash_wt_kqtzxi.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./login_xtlnif.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./poase_wt_plhgwc.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./settigngs_open_hjkomr.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./Screenshot_j0csjm.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546004/Palmr./dash_cndhwr.png",
  "https://res.cloudinary.com/technical-intelligence/image/upload/v1745546005/Palmr./profile_mizwvg.png",
];

const docsLink = "/docs/2.0.0-beta";

export default function HomePage() {
  return (
    <>
      <main className="relative z-[2] w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-screen-xl bg-background">
          <Hero />
          <LogoShowcase />
          <Feedback />
          <Introduction />
          <Architecture />
          <FileSection />
          <Highlights />
          <End />
        </div>
      </main>
      <FullWidthFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative z-[2] flex flex-col border-x border-t  px-6 pt-12 pb-10 md:px-12 md:pt-16 max-md:text-center">
      <h1 className="mb-8 text-5xl font-bold">🌴 Palmr.</h1>
      <h1 className="hidden text-4xl font-medium max-w-[600px] md:block mb-4">
        Modern & efficient file sharing
      </h1>
      <p className="mb-8 text-fd-muted-foreground md:max-w-[80%] md:text-xl">
        Palmr is a fast and secure platform for sharing files, built with
        performance and privacy in mind.
      </p>
      <div className="hidden h-[10rem] lg:flex items-center justify-center absolute right-0 top-10">
        <TextHoverEffect text="Palmr." />
      </div>
      <div className="inline-flex items-center gap-6 max-md:mx-auto mb-4">
        <PulsatingButton>
          <div className="flex gap-2 items-center">
            <BookOpenText size={18} />
            <Link href={docsLink}>Documentation</Link>
          </div>
        </PulsatingButton>

        <RippleButton>
          <a
            href="https://github.com/kyantech/Palmr"
            target="_blank"
            rel="noreferrer noopener"
            className="flex gap-2 items-center"
          >
            <GithubIcon size={18} />
            GitHub
          </a>
        </RippleButton>
      </div>
    </section>
  );
}

function LogoShowcase() {
  return (
    <div className="z-[2] border-x bg-background">
      <ThreeDMarquee images={images} className="rounded-none" />
    </div>
  );
}

function Feedback() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden border-x border-t px-6 py-8 md:py-16">
      <p className="text-xl font-medium flex items-center justify-center gap-2">
        A modern way to share files
        <WordRotate
          duration={4000}
          words={[
            "efficiently",
            "securely",
            "privately",
            "reliably",
            "seamlessly",
          ]}
          className="min-w-[100px] inline-block"
        />
      </p>
    </section>
  );
}

export function Introduction() {
  return (
    <section className="grid grid-cols-1 border-t border-x md:grid-cols-2">
      <div className="flex flex-col gap-4 border-r p-8 md:p-12">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-3 text-muted-foreground border border-foreground w-fit p-3 rounded-lg">
            <UploadIcon className="size-6 text-foreground" />
          </div>
          <h3 className="text-2xl font-semibold">Upload.</h3>
        </div>
        <p className="text-muted-foreground">
          Send your files quickly and safely.
        </p>
      </div>
      <div className="flex flex-col gap-4 border-r p-8 md:p-12">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-3 text-muted-foreground border border-foreground w-fit p-3 rounded-lg">
            <Share2Icon className="size-6 text-foreground" />
          </div>
          <h3 className="text-2xl font-semibold">Share.</h3>
        </div>
        <p className="text-muted-foreground">Easily share with anyone.</p>
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section className="flex flex-col gap-4 border-x border-t px-8 py-16 md:py-24 lg:flex-row md:px-12">
      <div className="flex-1 shrink-0 text-start">
        <p className="mb-4 w-fit bg-fd-primary px-2 py-1 text-md font-bold font-mono text-fd-primary-foreground">
          Carefully Built
        </p>
        <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
          A complete solution for file sharing.
        </h2>
        <p className="mb-6 text-fd-muted-foreground">
          From the upload to the link generation, everything is designed to be
          fast, reliable, and privacy-friendly.
          <br />
          <br />
          Every feature was crafted to deliver the best possible experience.
        </p>
      </div>
    </section>
  );
}

function FileSection() {
  return (
    <section
      className="relative overflow-hidden border-x border-t px-8 py-16 sm:py-24"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, var(--color-fd-secondary), var(--color-fd-background) 40%)",
      }}
    >
      <h2 className="text-center text-2xl font-semibold sm:text-3xl">
        File Sharing
        <TypingAnimation className="text-center text-2xl font-semibold sm:text-3xl">
          Free & Open Source
        </TypingAnimation>
      </h2>
      <AnimatedGridPattern className="opacity-5" />
    </section>
  );
}

function Highlights() {
  const features = [
    {
      icon: TimerIcon,
      title: "Fast & Efficient",
      text: "Optimized upload and download speeds.",
    },
    {
      icon: LayoutIcon,
      title: "Intuitive UI",
      text: "Clean, modern, and easy to use.",
    },
    {
      icon: RocketIcon,
      title: "Modern Stack",
      text: "Powered by Next.js, Fastify, MinIO, Postgres and the latest tech.",
    },
    {
      icon: SearchIcon,
      title: "Smart Search",
      text: "Find shared files quickly.",
    },
    {
      icon: KeyboardIcon,
      title: "Open API",
      text: "REST API endpoinds available for any integrations.",
    },
    {
      icon: PersonStandingIcon,
      title: "Customizable",
      text: "Full control over all the system and configurations.",
    },
  ];

  return (
    <section className="grid grid-cols-1 border-r md:grid-cols-2 lg:grid-cols-3">
      <div className="col-span-full flex items-start justify-center border-l border-t p-8 pb-2 text-center">
        <h2 className="bg-fd-primary px-1 text-2xl font-semibold text-fd-primary-foreground">
          Highlights
        </h2>
        <MousePointer className="-ml-1 mt-8" />
      </div>
      {features.map(({ icon, title, text }, i) => (
        <Highlight key={i} icon={icon} heading={title}>
          {text}
        </Highlight>
      ))}
    </section>
  );
}

function Highlight({
  icon: Icon,
  heading,
  children,
}: {
  icon: LucideIcon;
  heading: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border-l border-t px-6 py-12">
      <div className="mb-4 flex items-center gap-2 text-fd-muted-foreground">
        <Icon className="size-6" />
        <h2 className="text-sm font-medium">{heading}</h2>
      </div>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function End() {
  return (
    <section className="flex w-full flex-1">
      <div className="w-full flex flex-col gap-8 overflow-hidden border px-8 py-14">
        <h2 className="text-3xl font-extrabold font-mono uppercase ">
          Start Using Now. 🌴
        </h2>
        <ul className="mt-2 flex flex-col gap-6">
          <ListItem icon={TimerIcon} title="Fast Setup">
            Get up and running in minutes.
          </ListItem>
          <ListItem
            icon={BatteryChargingIcon}
            title="All under your own control"
          >
            Take full control of your file sharing infrastructure.
          </ListItem>
        </ul>
        <div className="flex flex-wrap gap-2 pt-14 pb-0 justify-end">
          <RippleButton>
            <div className="flex gap-2 items-center">
              <BookOpenText size={18} />
              <Link href={docsLink}>Documentation</Link>
            </div>
          </RippleButton>
          <RippleButton>
            <a
              href="https://github.com/kyantech/Palmr"
              target="_blank"
              rel="noreferrer noopener"
              className="flex gap-2 items-center"
            >
              <GithubIcon size={18} />
              GitHub
            </a>
          </RippleButton>
        </div>
      </div>
    </section>
  );
}

function ListItem({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <li>
      <span className="flex items-center gap-3 font-medium">
        <Icon className="size-8" />
        {title}
      </span>
      <span className="mt-2 block text-sm text-fd-muted-foreground">
        {children}
      </span>
    </li>
  );
}

function FullWidthFooter() {
  return (
    <footer className="w-full flex items-center justify-center p-6 border-t font-light container max-w-7xl">
      <div className="flex items-center gap-1 text-sm max-w-7xl">
        <span>Powered by</span>
        <Link
          href="http://kyantech.com.br"
          rel="noopener noreferrer"
          target="_blank"
          className="flex items-center hover:text-green-700 text-green-500 transition-colors font-light"
        >
          Kyantech Solutions ©
        </Link>
      </div>
    </footer>
  );
}
