export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PRIVATE_KEY: string;
      PROJECT_ID: string;
      ENV: "test" | "dev" | "prod";
    }
  }
}
