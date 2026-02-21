interface configItem {
    companyName?: string;
    frontend_base_url: string; // exclude trailing slash (e.g., "http://localhost:3000")
    backend_base_url: string; // exclude trailing slash (e.g., "http://localhost:8000")
    landing_page_url: string; // exclude trailing slash (e.g., "http://localhost:3001")
  }
  
  // -------------------------------------------------------------------------------------
  export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || "local";
  // -------------------------------------------------------------------------------------
  export const companyName = "Alvintech AI";
  // -------------------------------------------------------------------------------------
  const config: { [env: string]: configItem } = {
    test: {
      companyName: companyName,
      frontend_base_url: "https://app.alvintech.ca",
      backend_base_url: "https://api.alvintech.ca",
      landing_page_url: "https://alvintech.ca",
    },
    prod: {
      companyName: companyName,
      frontend_base_url: "https://app.alvintech.ca",
      backend_base_url: "https://api.alvintech.ca",
      landing_page_url: "https://alvintech.ca",
    },
    local: {
      companyName: companyName,
      frontend_base_url: "http://localhost:3000",
      backend_base_url: "http://localhost:8000",
      landing_page_url: "http://localhost:3001",
    },
  };
  
  // -------------------------------------------------------------------------------------
  // EXAMPLE USAGE:
  const ENVConfig = config[ENVIRONMENT];
  
  export default ENVConfig;