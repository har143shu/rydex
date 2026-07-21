import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import GeoUpdator from "@/components/GeoUpdator";
import Navbar from "@/components/Navbar";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";

export default async function Home() {
  const session = await auth();
  let user = null;
  if (session?.user?.email) {
    await connectDB();
    user = await User.findOne({ email: session?.user?.email });
  }
  return (
    <div className="w-full min-h-screen bg-white">
      {/* me chahta hu ki iss headless component se jab bhi user iss page ko access kare toh wo ek event call kare socket ke webSocket ko jisse me iski socketId ya location store kra pau*/}
      {user && <GeoUpdator userId={user._id.toString()} />}
      {user?.role === "partner" ? (
        <>
          <Navbar />
          <PartnerDashboard />
        </>
      ) : user?.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <>
          <Navbar />
          <PublicHome />
        </>
      )}

      <Footer />
    </div>
  );
}
