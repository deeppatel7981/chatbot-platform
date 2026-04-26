import "next-auth";

export type AppAccessMode = "full" | "portal";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      organizationId?: string;
      accessMode?: AppAccessMode;
      portalClientIds?: string[];
    };
  }

  interface User {
    organizationId?: string;
    accessMode?: AppAccessMode;
    portalClientIds?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    organizationId?: string;
    accessMode?: AppAccessMode;
    portalClientIds?: string[];
  }
}
