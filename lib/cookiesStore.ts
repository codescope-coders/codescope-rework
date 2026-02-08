// ./lib/CookiesStore.ts
import Cookies from "js-cookie";

class CookieStore {
  private isServer: boolean;

  constructor() {
    this.isServer = typeof window === "undefined";
  }

  async get(key: string): Promise<string | undefined> {
    if (this.isServer) {
      // Handle server-side case (if needed)
      return undefined; // Or implement server-side logic
    } else {
      // Client-side case
      return Cookies.get(key);
    }
  }

  async set(
    key: string,
    value: string,
    options?: Cookies.CookieAttributes,
  ): Promise<void> {
    if (!this.isServer) {
      Cookies.set(key, value, options);
    }
  }

  async remove(key: string, options?: Cookies.CookieAttributes): Promise<void> {
    if (!this.isServer) {
      Cookies.remove(key, options);
    }
  }
}

const cookieStore = new CookieStore();
export default cookieStore;
