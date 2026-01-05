/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  macroData?: {
    macros: Record<string, {
      name: string;
      fullName: string;
      category: string;
      description: string;
      expansion?: string;
      parameterized?: boolean;
      tags?: string[];
    }>;
    categories: Record<string, { name: string; description: string }>;
    tags: Record<string, { name: string; description: string }>;
  };
}
