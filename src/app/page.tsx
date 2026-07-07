import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
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
