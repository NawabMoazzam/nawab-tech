import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
export const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";

function getImageKitInstance() {
  if (!publicKey || !privateKey || !urlEndpoint) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      // Return dummy instance during build
      return new ImageKit({
        publicKey: "build_dummy_public",
        privateKey: "build_dummy_private",
        urlEndpoint: "https://ik.imagekit.io/build_dummy",
      });
    }
    console.warn(
      "ImageKit env vars missing: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT",
    );
  }

  return new ImageKit({
    publicKey: publicKey || "dummy",
    privateKey: privateKey || "dummy",
    urlEndpoint: urlEndpoint || "https://ik.imagekit.io/dummy",
  });
}

// For backward compat, export instance lazily via Proxy
export const imagekit = new Proxy({} as ImageKit, {
  get(_, prop) {
    const instance = getImageKitInstance();
    const value = Reflect.get(instance, prop);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

// Helper to get authenticated params for client-side upload
export function getImageKitAuthParams() {
  const instance = getImageKitInstance();
  return instance.getAuthenticationParameters();
}

// Helper to build optimized URL
export function buildImageKitUrl(path: string, transformations?: string[]) {
  const endpoint = (process.env.IMAGEKIT_URL_ENDPOINT || "").replace(/\/$/, "");
  const tr = transformations?.length ? `tr:${transformations.join(",")}` : "";
  if (tr) {
    return `${endpoint}/${tr}/${path.replace(/^\//, "")}`;
  }
  return `${endpoint}/${path.replace(/^\//, "")}`;
}
