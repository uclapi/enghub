import Footer from "./Footer.react";
import Navbar from "./NavBar.react";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
