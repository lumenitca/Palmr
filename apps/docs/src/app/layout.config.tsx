import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Github } from "lucide-react";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "🌴 Palmr.",
  },
  links: [
    {
      text: "Docs",
      url: "/docs/2.0.0-beta",
      active: "nested-url",
    },
		{
			text: "Github",
			url: "https://github.com/kyantech/Palmr",
			active: "nested-url",
			icon: (
				<>
					<Github fill="currentColor" />
				</>
			),
		}
	],
};
