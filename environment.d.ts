export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INFURA_API_KEY: string;
      ENV: "test" | "dev" | "prod";
    }
  }
}
