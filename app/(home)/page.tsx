import Link from "next/link";

import { InstallCommand } from "@/components/docs/install-command";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const Page = () => (
  <main className="w-full">
    <section className="px-4 pt-16 pb-24 sm:px-6 lg:pt-24 lg:pb-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        <h1 className="font-heading max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Videorc&apos;s interface, as a component library.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base text-balance sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link className={buttonVariants({ size: "lg" })} href="/docs">
            Get started
          </Link>
        </div>
        <div className="w-full max-w-md text-left">
          <InstallCommand
            command={`npx shadcn@latest add ${siteConfig.registryNamespace}/theme`}
          />
        </div>
      </div>
    </section>
  </main>
);

export default Page;
