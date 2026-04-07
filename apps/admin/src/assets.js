const publicPath = normalizePublicPath(process.env.VITE_PUBLIC_PATH || "/");

function normalizePublicPath(value) {
  if (!value || value === "/") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function withPublicPath(assetPath) {
  return `${publicPath}${assetPath}`.replace(/\/{2,}/g, "/").replace(":/", "://");
}

export const brandAssets = {
  mainLogo: withPublicPath("assets/images/main%20logo.png")
};

export const travelGalleryAssets = [
  withPublicPath("assets/images/330823062_744666710330433_3368611478884532484_n.jpg"),
  withPublicPath("assets/images/355464106_930846967974321_4531387690846332912_n.jpg"),
  withPublicPath("assets/images/363177449_852714189103816_3985987692913632703_n.jpg")
];

export const peopleAssets = [
  withPublicPath("assets/images/profile%20picture%201.jpg"),
  withPublicPath("assets/images/profile%20picture%202.jpg")
];
