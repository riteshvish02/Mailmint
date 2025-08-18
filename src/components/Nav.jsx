import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Menu,
  X,
  ShoppingBag,
  User,
  Heart,
  Bell,
  Settings,
  LogOut,
  Search,
  Home,
  Phone,
  Info,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { Image } from "@unpic/react";
import { useDispatch, useSelector } from "react-redux";
import { userLogout, fetchUserProfile } from "../store/actions/useraction";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Nav = () => {
  const { isAuthenticated, user } = useSelector((state) => state.User);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const mobileMenuRef = useRef();
  const userMenuRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(userLogout());
  };
  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md ${
          isScrolled
            ? "bg-white/95 shadow-lg border-b border-gray-200/50"
            : "bg-white/90 border-b border-gray-100"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link className="flex items-center">
              <Image
                src="/Screenshot_2025-06-02_231235-removebg-preview.png"
                alt="Logo"
                width={100}
                height={40}
                className="h-10 w-auto object-cover object-center"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 font-medium hover:text-gray-600 transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
           

            <Link
              to="/shop"
              className="text-gray-700 font-medium hover:text-gray-600 transition-colors duration-200 relative group"
            >
              Shop
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>

            <Link
              to="/contact"
              className="text-gray-700 font-medium hover:text-gray-600 transition-colors duration-200 relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>

            <div className="relative group">
              <button className="flex items-center text-gray-700 font-medium hover:text-gray-600 transition-colors duration-200">
                Learn More
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-100 hidden group-hover:block transition-all duration-300 transform origin-top">
                <div className="py-3">
                  <Link
                    to="/about"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-gray-600 hover:bg-gray-300/50 transition-colors"
                  >
                    <Info className="h-4 w-4 mr-3" />
                    About Us
                  </Link>
                  <Link
                    to="/faq"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-gray-600 hover:bg-gray-300/50 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4 mr-3" />
                    FAQ
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-600 hover:bg-gray-300 rounded-lg transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              {isLoggedIn ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>
              ) : (
                <Link
                  to={`/auth`}
                  className="text-gray-700 font-medium hover:text-gray-600 transition-colors"
                >
                  Sign In
                </Link>
              )}

              {userMenuOpen && isLoggedIn && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl rounded-xl z-50 opacity-100 scale-100 transition-all duration-200">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user && user.firstName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user && user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    {[
                      { icon: User, label: "My Profile", to: "/profile" },
                      {
                        icon: ShoppingBag,
                        label: "Order History",
                        to: "/orders",
                      },
                      { icon: Heart, label: "Wishlist", to: "/wishlist" },
                      {
                        icon: Bell,
                        label: "Notifications",
                        to: "/notifications",
                      },
                      {
                        icon: Settings,
                        label: "Account Settings",
                        to: "/settings",
                      },
                      {
                        icon:  LayoutDashboard,
                        label: "Admin Dashboard",
                        to: "/admin/dashboard",
                      }, // ✅ Add this line
                    ].map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-gray-600 hover:bg-gray-300/50 transition-colors"
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <Link
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg py-2 font-medium transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <button className="bg-black  text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Buy Now
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-600 hover:bg-gray-300 rounded-lg transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {!isLoggedIn && (
              <Link
                to={`/auth`}
                className="bg-black text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign In
              </Link>
            )}

            <button
              className="bg-black text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => (window.location.to = "/checkout")}
            >
              Buy Now
            </button>

            <button
              className="p-2 text-gray-700 hover:text-gray-600 hover:bg-gray-300 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu */}
          <div
            className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl z-50 overflow-y-auto shadow-2xl transform transition-transform duration-300"
            ref={mobileMenuRef}
            style={{
              transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                  <Link className="flex items-center">
                    <Image
                      src="/Screenshot_2025-06-02_231235-removebg-preview.png"
                      alt="Logo"
                      width={100}
                      height={40}
                      className="h-10 w-auto object-cover object-center"
                    />
                  </Link>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              {/* User Info (if logged in) */}
              {isLoggedIn && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user && user.firstName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user && user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="space-y-2">
                {/* Main Links */}
                {[
                  { icon: Home, label: "Home", to: "/" },
                  { icon: ShoppingBag, label: "Shop", to: "/shop" },
                  { icon: Phone, label: "Contact", to: "/contact" },
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center p-4 rounded-xl text-gray-700 hover:text-gray-600 hover:bg-gray-300 transition-colors group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                {/* Learn More Dropdown */}
                <div className="space-y-2">
                  <button
                    className="flex items-center justify-between w-full p-4 rounded-xl text-gray-700 hover:text-gray-600 hover:bg-gray-300 transition-colors group"
                    onClick={() => setLearnMoreOpen(!learnMoreOpen)}
                  >
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Learn More</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        learnMoreOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {learnMoreOpen && (
                    <div className="overflow-hidden ml-4 space-y-1 transition-all duration-200">
                      <Link
                        to="/about"
                        className="flex items-center p-3 rounded-lg text-gray-600 hover:text-gray-600 hover:bg-gray-300 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-sm font-medium">About Us</span>
                      </Link>
                      <Link
                        to="/faq"
                        className="flex items-center p-3 rounded-lg text-gray-600 hover:text-gray-600 hover:bg-gray-300 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-sm font-medium">FAQ</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Account Section */}
                {isLoggedIn && (
                  <div className="space-y-2">
                    <button
                      className="flex items-center justify-between w-full p-4 rounded-xl text-gray-700 hover:text-gray-600 hover:bg-gray-300 transition-colors group"
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">My Account</span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          accountMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {accountMenuOpen && (
                      <div className="overflow-hidden ml-4 space-y-1 transition-all duration-200">
                        {[
                          { icon: User, label: "Profile", to: "/profile" },
                          { icon: ShoppingBag, label: "Orders", to: "/orders" },
                          { icon: Heart, label: "Wishlist", to: "/wishlist" },
                          {
                            icon: Settings,
                            label: "Settings",
                            to: "/settings",
                          },
                        ].map((item, index) => (
                          <Link
                            key={index}
                            to={item.to}
                            className="flex items-center p-3 rounded-lg text-gray-600 hover:text-gray-600 hover:bg-gray-300 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </nav>

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-black text-white p-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign In
                  </button>
                )}

                <div className="text-center">
                  <p className="text-gray-500 text-xs">
                    © {new Date().getFullYear()} Brand. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Nav;
